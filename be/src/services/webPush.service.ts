import prisma from '../../prisma/client';
import webpush from 'web-push';

export interface PushPayload {
  title: string;
  message: string;
  url?: string;
  notificationId?: string;
  typeCode?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  timestamp?: number;
}

export interface SubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class WebPushService {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly subject: string;
  private isConfigured = false;

  constructor() {
    this.publicKey =
      process.env.VAPID_PUBLIC_KEY ||
      'BDW-jwuCe4hFxc51bjwmsxdVc704Re2uZ5PK94GnBF24ncT_9mK0luW859k-_G1Lq2KK2UMoTKzIN7zYEheK1ec';
    this.privateKey =
      process.env.VAPID_PRIVATE_KEY || '3nYRnf0FG9bXXTgUFoNlviUDlDTCGSlthmlZCqF8PuQ';
    this.subject = process.env.VAPID_SUBJECT || 'mailto:simadadmin@dikkzycode.my.id';

    this.init();
  }

  private init() {
    try {
      if (this.publicKey && this.privateKey && this.subject) {
        webpush.setVapidDetails(this.subject, this.publicKey, this.privateKey);
        this.isConfigured = true;
      }
    } catch (err) {
      console.error('[WebPushService] Failed to configure VAPID details:', err);
    }
  }

  public getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Menyimpan atau memperbarui langganan Web Push peserta/pengguna
   */
  public async subscribe(userId: string, sub: SubscriptionInput, userAgent?: string) {
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      throw new Error('Format langganan Web Push tidak valid.');
    }

    return await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userAgent: userAgent || null,
      },
      update: {
        userId,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userAgent: userAgent || null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Menghapus langganan Web Push
   */
  public async unsubscribe(userId: string, endpoint: string) {
    return await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId },
    });
  }

  /**
   * Mengirim notifikasi Web Push secara BULK / BATCH ke perangkat peserta magang
   * - Mendukung broadcast global (ke seluruh peserta/pengguna terdaftar)
   * - Mendukung pengiriman tertarget (berdasarkan array userIds)
   * - Memproses dalam konkurensi batch (chunked concurrency)
   * - Otomatis membersihkan subscription yang sudah kedaluwarsa (HTTP 404 / 410 Gone)
   */
  public async sendBulkPush(
    payload: PushPayload,
    targetUserIds?: string[],
    isBroadcast = false,
  ): Promise<{ total: number; sent: number; failed: number; pruned: number }> {
    if (!this.isConfigured) {
      this.init();
      if (!this.isConfigured) {
        console.warn('[WebPushService] VAPID is not configured. Skipping push notification.');
        return { total: 0, sent: 0, failed: 0, pruned: 0 };
      }
    }

    try {
      // 1. Ambil seluruh subscription sesuai target
      const whereClause: Record<string, unknown> = {};
      if (!isBroadcast && targetUserIds && targetUserIds.length > 0) {
        whereClause.userId = { in: targetUserIds };
      }

      const subscriptions = await prisma.pushSubscription.findMany({
        where: whereClause,
      });

      if (subscriptions.length === 0) {
        return { total: 0, sent: 0, failed: 0, pruned: 0 };
      }

      // Format payload JSON untuk service worker
      const notificationData = JSON.stringify({
        title: payload.title || 'SIMAD - Notifikasi Baru',
        message: payload.message || '',
        body: payload.message || '',
        url: payload.url || '/notifications',
        tag: payload.tag || `simad-${Date.now()}`,
        icon: payload.icon || '/images/logos.png',
        badge: payload.badge || '/images/logos.png',
        timestamp: payload.timestamp || Date.now(),
        data: {
          notificationId: payload.notificationId,
          typeCode: payload.typeCode,
          url: payload.url || '/notifications',
        },
      });

      let sentCount = 0;
      let failedCount = 0;
      const staleEndpoints: string[] = [];

      // 2. Batching chunk (25 subscription per batch) agar hemat koneksi socket
      const CHUNK_SIZE = 25;
      for (let i = 0; i < subscriptions.length; i += CHUNK_SIZE) {
        const chunk = subscriptions.slice(i, i + CHUNK_SIZE);

        const pushPromises = chunk.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, notificationData, {
              TTL: 86400, // Simpan di push service selama 24 jam jika perangkat offline
              urgency: 'high',
            });
            sentCount++;
          } catch (err: any) {
            failedCount++;
            // 404 (Not Found) atau 410 (Gone) berarti user mencopot PWA atau mencabut izin
            if (err.statusCode === 404 || err.statusCode === 410) {
              staleEndpoints.push(sub.endpoint);
            } else {
              console.warn(
                `[WebPushService] Gagal mengirim push ke ${sub.endpoint.slice(0, 30)}...:`,
                err?.message || err,
              );
            }
          }
        });

        await Promise.allSettled(pushPromises);
      }

      // 3. Bersihkan subscription yang sudah kedaluwarsa dari database
      let prunedCount = 0;
      if (staleEndpoints.length > 0) {
        const deleteResult = await prisma.pushSubscription.deleteMany({
          where: { endpoint: { in: staleEndpoints } },
        });
        prunedCount = deleteResult.count;
      }

      return {
        total: subscriptions.length,
        sent: sentCount,
        failed: failedCount,
        pruned: prunedCount,
      };
    } catch (error) {
      console.error('[WebPushService] Bulk push execution error:', error);
      return { total: 0, sent: 0, failed: 0, pruned: 0 };
    }
  }
}

export default new WebPushService();

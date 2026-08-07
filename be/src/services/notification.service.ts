import { AppError } from '@/http/error';
import type {
  NotificationQuery,
  NotificationResponse,
  SendNotificationBody,
} from '@/types/notification.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Notification.
 * - Notifikasi personal hanya terlihat oleh penerima (BR-NOTIF-006);
 *   keterkaitan pengguna disimpan via tabel `notification_reads`
 *   (baris readAt = null berarti status "Delivered" — BR-NOTIF-004/005).
 * - Notifikasi broadcast terlihat oleh seluruh pengguna (BR-NOTIF-007).
 * - Seluruh notifikasi tersimpan sebagai histori (BR-NOTIF-008) —
 *   DELETE hanya menghapus keterkaitan pengguna (soft delete per user).
 * Sumber aturan: docs/07-api-specification.md §18, docs/04-business-rules.md §24.
 */
class NotificationService {
  private readonly notificationInclude = {
    type: { select: { id: true, code: true, name: true } },
    sender: { select: { id: true, fullName: true, email: true } },
  } as const;

  private serialize(notification: any, readAt: Date | null = null): NotificationResponse {
    return {
      id: notification.id,
      typeId: notification.typeId,
      typeCode: notification.type?.code ?? null,
      typeName: notification.type?.name ?? null,
      title: notification.title,
      message: notification.message,
      isBroadcast: notification.isBroadcast,
      senderId: notification.senderId,
      senderName: notification.sender?.fullName ?? null,
      createdAt: notification.createdAt,
      readAt,
      isRead: readAt != null,
    };
  }

  /** Ambil notifikasi dengan include + readAt milik user tertentu. */
  private async findForUser(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        ...this.notificationInclude,
        notificationReads: {
          where: { userId },
          select: { readAt: true },
        },
      },
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    // BR-NOTIF-006: user hanya dapat melihat notifikasi miliknya sendiri,
    // kecuali broadcast (BR-NOTIF-007).
    const isVisible = notification.isBroadcast || notification.notificationReads.length > 0;
    if (!isVisible) {
      throw new AppError(403, 'Access denied. You can only view your own notifications');
    }

    return notification;
  }

  private buildVisibilityWhere(userId: string): Record<string, unknown> {
    return {
      OR: [{ isBroadcast: true }, { notificationReads: { some: { userId } } }],
    };
  }

  // ─── 18.1 Get Notifications ──────────────────────────────────────

  public async getMyNotifications(userId: string, query: NotificationQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = this.buildVisibilityWhere(userId);
    const [total, notifications] = await prisma.$transaction([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ...this.notificationInclude,
          notificationReads: {
            where: { userId },
            select: { readAt: true },
          },
        },
      }),
    ]);

    const data = notifications.map((n: (typeof notifications)[number]) =>
      this.serialize(n, n.notificationReads[0]?.readAt ?? null),
    );

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── 18.2 Get Notification Detail ────────────────────────────────

  public async getById(userId: string, notificationId: string) {
    const notification = await this.findForUser(notificationId, userId);

    // BR-NOTIF-005: status Read dicatat ketika pengguna membuka notifikasi.
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: { notificationId, userId },
      },
      create: { notificationId, userId, readAt: new Date() },
      update: { readAt: new Date() },
    });

    return this.serialize(notification, new Date());
  }

  // ─── 18.3 Mark As Read ───────────────────────────────────────────

  public async markAsRead(userId: string, notificationId: string) {
    await this.findForUser(notificationId, userId);

    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: { notificationId, userId },
      },
      create: { notificationId, userId, readAt: new Date() },
      update: { readAt: new Date() },
    });

    return this.getById(userId, notificationId);
  }

  // ─── 18.4 Mark All As Read ───────────────────────────────────────

  public async markAllAsRead(userId: string) {
    const now = new Date();

    // 1. Update baris read yang sudah ada (readAt null → now).
    const updated = await prisma.notificationRead.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });

    // 2. Notifikasi broadcast yang belum punya baris read untuk user ini.
    const unreadBroadcast = await prisma.notification.findMany({
      where: {
        isBroadcast: true,
        notificationReads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unreadBroadcast.length > 0) {
      await prisma.notificationRead.createMany({
        data: unreadBroadcast.map((n) => ({
          notificationId: n.id,
          userId,
          readAt: now,
        })),
      });
    }

    return { count: updated.count + unreadBroadcast.length };
  }

  // ─── 18.5 Delete Notification (soft delete per user) ─────────────

  public async remove(userId: string, notificationId: string) {
    await this.findForUser(notificationId, userId);

    // Notifikasi tidak dihapus dari database (BR-NOTIF-008 — histori).
    // Keterkaitan pengguna dihapus sehingga tidak muncul lagi di list.
    await prisma.notificationRead.deleteMany({
      where: { notificationId, userId },
    });

    return { id: notificationId };
  }

  // ─── 18.6 Unread Count ───────────────────────────────────────────

  public async unreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        AND: [
          this.buildVisibilityWhere(userId),
          { notificationReads: { none: { userId, readAt: { not: null } } } },
        ],
      },
    });
    return { count };
  }

  // ─── 18.7 Send Notification (HR_ADMIN) ───────────────────────────

  public async send(userId: string, input: SendNotificationBody) {
    // Resolve NotificationType berdasarkan code (BR-NOTIF-003).
    let typeId: string | null = null;
    if (input.typeCode) {
      let type = await prisma.notificationType.findUnique({
        where: { code: input.typeCode },
      });
      if (!type) {
        type = await prisma.notificationType.create({
          data: { code: input.typeCode, name: input.typeCode },
        });
      }
      typeId = type.id;
    }

    const notification = await prisma.notification.create({
      data: {
        typeId,
        title: input.title,
        message: input.message,
        isBroadcast: input.isBroadcast ?? false,
        senderId: userId,
      },
    });

    // Notifikasi personal: buat baris NotificationRead (readAt null = Delivered).
    if (!notification.isBroadcast && input.userIds && input.userIds.length > 0) {
      await prisma.notificationRead.createMany({
        data: input.userIds.map((targetUserId) => ({
          notificationId: notification.id,
          userId: targetUserId,
        })),
      });
    }

    return this.getById(userId, notification.id);
  }
}

export default new NotificationService();

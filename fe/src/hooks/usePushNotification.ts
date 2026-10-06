'use client';

import Api from '@/services/props.service';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type PushPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Mengubah string URL-safe Base64 VAPID public key menjadi Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [permission, setPermission] = useState<PushPermissionStatus>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Cek apakah browser mendukung Web Push & Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (!supported) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission as PushPermissionStatus);

    // Cek subscription aktif
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(Boolean(subscription));
      })
      .catch((err) => {
        console.warn('[usePushNotification] Gagal memeriksa status subscription:', err);
      });
  }, []);

  /**
   * Mendaftarkan Web Push Notification pada perangkat HP/browser
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Browser ini tidak mendukung notifikasi push.');
      return false;
    }

    setIsLoading(true);
    try {
      // 1. Minta izin notifikasi pengguna
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionStatus);

      if (perm !== 'granted') {
        toast.warning(
          perm === 'denied'
            ? 'Izin notifikasi diblokir. Mohon izinkan notifikasi pada pengaturan browser Anda.'
            : 'Izin notifikasi belum diberikan.',
        );
        setIsLoading(false);
        return false;
      }

      // 2. Ambil VAPID Public Key dari backend atau env
      let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        const keyRes = await Api.Notification.GetVapidPublicKey();
        publicKey = keyRes.data?.publicKey;
      }

      if (!publicKey) {
        throw new Error('VAPID Public Key tidak ditemukan.');
      }

      // 3. Pastikan Service Worker ready
      const registration = await navigator.serviceWorker.ready;

      // 4. Daftarkan Push Manager
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });

      // 5. Kirim subscription ke backend untuk disimpan di database
      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Gagal mengekstrak kredensial push dari browser.');
      }

      await Api.Notification.SubscribePush({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      });

      setIsSubscribed(true);
      toast.success('Notifikasi HP (PWA) berhasil diaktifkan! Anda akan menerima update secara real-time.');
      return true;
    } catch (error: any) {
      console.error('[usePushNotification] Error subscribing:', error);
      toast.error(error?.message || 'Gagal mengaktifkan notifikasi push.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Membatalkan Web Push Notification
   */
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await Api.Notification.UnsubscribePush({ endpoint });
      }

      setIsSubscribed(false);
      toast.info('Notifikasi push pada perangkat ini telah dinonaktifkan.');
      return true;
    } catch (error: any) {
      console.error('[usePushNotification] Error unsubscribing:', error);
      toast.error('Gagal menonaktifkan notifikasi push.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Mengirim notifikasi uji coba langsung ke perangkat
   */
  const sendTestNotification = useCallback(async () => {
    if (!isSupported || Notification.permission !== 'granted') {
      toast.warning('Silakan aktifkan notifikasi terlebih dahulu.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).showNotification('SIMAD - Uji Coba Notifikasi PWA', {
        body: 'Notifikasi berhasil terhubung! Anda akan menerima seluruh informasi kegiatan magang secara langsung di HP.',
        icon: '/images/logos.png',
        badge: '/images/logos.png',
        tag: 'test-notification',
        vibrate: [200, 100, 200],
      });
      toast.success('Notifikasi uji coba dikirim ke perangkat Anda.');
    } catch (err: any) {
      toast.error('Gagal menampilkan notifikasi uji coba: ' + err?.message);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

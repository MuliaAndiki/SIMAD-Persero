'use client';

import { NotificationsSection } from '@/components/page/notifications/NotificationsSection';
import { useNotification } from '@/hooks/useService/notification/useNotification';
import { useApi } from '@/hooks/useService/useApi';
import { toast } from 'sonner';

export default function NotificationsContainer() {
  const api = useApi();
  const notif = useNotification();

  const me = api.auth.query.me();
  const role = me.data?.role;

  // Mengambil daftar notifikasi terbaru (limit 100 untuk histori lengkap di laman notifikasi)
  const notificationsQuery = notif.query.list({ limit: 100 }, { enabled: Boolean(role) });
  const unreadQuery = notif.query.unreadCount({ enabled: Boolean(role) });

  const markAsReadMutation = notif.mutate.markAsRead();
  const markAllAsReadMutation = notif.mutate.markAllAsRead();
  const deleteMutation = notif.mutate.delete();
  const sendMutation = notif.mutate.send();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  // Handler: Tandai satu notifikasi telah dibaca
  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(
      { notificationId },
      {
        onError: () => {
          toast.error('Gagal memperbarui status notifikasi.');
        },
      },
    );
  };

  // Handler: Tandai semua notifikasi telah dibaca
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Semua notifikasi berhasil ditandai telah dibaca.');
      },
      onError: () => {
        toast.error('Gagal menandai semua notifikasi.');
      },
    });
  };

  // Handler: Hapus notifikasi (soft delete)
  const handleDelete = (notificationId: string) => {
    deleteMutation.mutate(
      { notificationId },
      {
        onSuccess: () => {
          toast.success('Notifikasi berhasil dihapus dari daftar.');
        },
        onError: () => {
          toast.error('Gagal menghapus notifikasi.');
        },
      },
    );
  };

  // Handler: Kirim pengumuman siaran baru (khusus HR Admin)
  const handleSendBroadcast = async (data: {
    title: string;
    message: string;
    typeCode?: string;
    isBroadcast?: boolean;
  }) => {
    try {
      await sendMutation.mutateAsync({
        title: data.title,
        message: data.message,
        typeCode: data.typeCode ?? 'ANNOUNCEMENT',
        isBroadcast: true,
      });
      toast.success('Pengumuman siaran berhasil dikirim ke seluruh pengguna.');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim pengumuman.');
      throw err;
    }
  };

  return (
    <NotificationsSection
      role={role}
      notifications={notifications}
      unreadCount={unreadCount}
      isPending={notificationsQuery.isPending}
      isError={notificationsQuery.isError}
      onRefresh={() => {
        notificationsQuery.refetch();
        unreadQuery.refetch();
      }}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onSendBroadcast={handleSendBroadcast}
      isMarkingAllRead={markAllAsReadMutation.isPending}
      isSendingBroadcast={sendMutation.isPending}
    />
  );
}

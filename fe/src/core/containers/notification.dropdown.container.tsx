'use client';

import { getRoleDashboardPath } from '@/configs/app.config';
import NotificationDropdown from '@/core/components/notification.dropdown';
import { useNotification } from '@/hooks/useService/notification/useNotification';
import { useApi } from '@/hooks/useService/useApi';

/** Status aplikasi yang menunggu review HR (ditampilkan di "Pengajuan Masuk"). */
const PENDING_APPLICATION_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'RESUBMITTED'];

/**
 * Container NotificationDropdown — orchestration layer.
 *
 * SEMUA fetch API (React Query) berada di sini: auth/me, notifikasi, unread
 * count, serta daftar aplikasi yang digate berdasarkan role (INTERN → `my`,
 * HR_ADMIN → `list`). Komponen presentasional (NotificationDropdown →
 * NotificationDropdownContent) hanya menerima props — tidak memanggil API.
 */
export default function NotificationDropdownContainer() {
  const api = useApi();
  const notif = useNotification();

  const me = api.auth.query.me();
  const role = me.data?.role;
  const roleUpper = role?.toUpperCase();
  const rolePath = getRoleDashboardPath(role);

  const isIntern = roleUpper === 'INTERN';
  const isHr = roleUpper === 'HR_ADMIN';

  const notifications = notif.query.list({ limit: 10 }, { enabled: Boolean(role) });
  const unread = notif.query.unreadCount({ enabled: Boolean(role) });
  const myApps = api.application.query.my({ enabled: isIntern });
  const hrApplications = api.application.query.list({ limit: 10 }, { enabled: isHr });

  const markAllAsRead = notif.mutate.markAllAsRead();
  const markAsRead = notif.mutate.markAsRead();

  const unreadCount = unread.data?.count ?? 0;

  // Sortir terbaru → terlama agar konsisten di semua section.
  const sortedNotifications = [...(notifications.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const sortedMyApps = [...(myApps.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pendingApplications = [...(hrApplications.data ?? [])]
    .filter((app) => PENDING_APPLICATION_STATUSES.includes(app.status ?? ''))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <NotificationDropdown
      role={role}
      rolePath={rolePath}
      unreadCount={unreadCount}
      notifications={sortedNotifications}
      notificationsPending={notifications.isPending}
      myApplications={sortedMyApps}
      myApplicationsPending={myApps.isPending}
      pendingApplications={pendingApplications}
      pendingApplicationsPending={hrApplications.isPending}
      onMarkAllAsRead={() => markAllAsRead.mutate()}
      onMarkAsRead={(notificationId) => markAsRead.mutate({ notificationId })}
    />
  );
}

import type { NotificationResponse } from '@/types/api/notification.types';
import { BellOff } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

export interface NotificationListProps {
  notifications: NotificationResponse[];
  onMarkAsRead: (notificationId: string) => void;
  emptyMessage?: string;
}

/** Daftar notifikasi + empty state untuk NotificationDropdown. */
export function NotificationList({
  notifications,
  onMarkAsRead,
  emptyMessage = 'Tidak ada notifikasi.',
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
        <BellOff className="size-6 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}

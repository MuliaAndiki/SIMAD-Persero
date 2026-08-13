'use client';

import type { NotificationResponse } from '@/types/api/notification.types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/string.format';

export interface NotificationItemProps {
  notification: NotificationResponse;
  onMarkAsRead: (notificationId: string) => void;
}

/** Satu baris notifikasi di dalam NotificationDropdown. */
export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60',
        !notification.isRead && 'bg-primary/5',
      )}
    >
      <span
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          notification.isRead ? 'bg-transparent' : 'bg-primary',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{notification.title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
        <span className="text-[11px] text-muted-foreground/70">
          {formatDate(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}

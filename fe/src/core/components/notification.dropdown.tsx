'use client';

import { DropdownMenu, DropdownMenuTrigger } from '@/components/atoms';
import { Button } from '@/components/atoms/button';
import {
  NotificationDropdownContent,
  type NotificationDropdownContentProps,
} from '@/components/organisms/notification/NotificationDropdownContent';
import { Bell } from 'lucide-react';

export type NotificationDropdownProps = NotificationDropdownContentProps;

/**
 * NotificationDropdown — komponen PRESENTASIONAL murni (tidak fetch API).
 *
 * Semua data & handler berasal dari `NotificationDropdownContainer`
 * (orchestration layer). Bell trigger + badge unread di sini, sedangkan
 * isi panel didelegasikan ke NotificationDropdownContent.
 */
export default function NotificationDropdown({
  unreadCount,
  ...contentProps
}: NotificationDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-0" aria-label="Notifikasi">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <NotificationDropdownContent unreadCount={unreadCount} {...contentProps} />
    </DropdownMenu>
  );
}

'use client';

import { DropdownMenuLabel } from '@/components/atoms';
import { Button } from '@/components/atoms/button';
import { CheckCheck } from 'lucide-react';

export interface NotificationDropdownHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

/** Header panel notifikasi: judul + aksi "Tandai dibaca". */
export function NotificationDropdownHeader({
  unreadCount,
  onMarkAllAsRead,
}: NotificationDropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <DropdownMenuLabel className="px-0">Notifikasi</DropdownMenuLabel>
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={onMarkAllAsRead}
        >
          <CheckCheck className="size-3.5" />
          Tandai dibaca
        </Button>
      )}
    </div>
  );
}

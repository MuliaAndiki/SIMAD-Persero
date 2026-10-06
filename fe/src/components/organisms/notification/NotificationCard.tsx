'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import type { NotificationResponse } from '@/types/api/notification.types';
import { cn } from '@/utils/classname';
import { formatDateTime } from '@/utils/string.format';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCheck,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Megaphone,
  Radio,
  Trash2,
  User,
} from 'lucide-react';

export interface NotificationCardProps {
  notification: NotificationResponse;
  onSelect: (notification: NotificationResponse) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
}

function getNotificationTypeVisuals(notification: NotificationResponse) {
  const code = (notification.typeCode || notification.typeName || '').toUpperCase();
  const text = (notification.title + ' ' + notification.message).toLowerCase();

  if (notification.isBroadcast || code.includes('BROADCAST') || code.includes('ANNOUNCEMENT')) {
    return {
      icon: Megaphone,
      badgeLabel: 'Pengumuman Siaran',
      badgeClass: 'bg-primary/10 text-primary border-primary/25',
      iconContainer: 'text-primary bg-primary/10 dark:bg-primary/20',
    };
  }

  if (code.includes('WARN') || text.includes('peringatan') || text.includes('ditolak')) {
    return {
      icon: AlertTriangle,
      badgeLabel: notification.typeName || 'Peringatan',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/25',
      iconContainer: 'text-destructive bg-destructive/10 dark:bg-destructive/20',
    };
  }

  if (text.includes('absensi') || text.includes('koreksi') || text.includes('presensi')) {
    return {
      icon: Clock,
      badgeLabel: notification.typeName || 'Absensi',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      iconContainer: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20',
    };
  }

  if (text.includes('sertifikat') || text.includes('certificate')) {
    return {
      icon: Award,
      badgeLabel: notification.typeName || 'Sertifikat',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      iconContainer: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
    };
  }

  if (text.includes('pengajuan') || text.includes('berkas') || text.includes('dokumen')) {
    return {
      icon: FileText,
      badgeLabel: notification.typeName || 'Pengajuan',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
      iconContainer: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20',
    };
  }

  return {
    icon: Info,
    badgeLabel: notification.typeName || 'Informasi',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    iconContainer: 'text-muted-foreground bg-muted',
  };
}

export function NotificationCard({
  notification,
  onSelect,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationCardProps) {
  const visuals = getNotificationTypeVisuals(notification);
  const VisualIcon = visuals.icon;
  const isUnread = !notification.isRead;

  return (
    <div
      onClick={() => onSelect(notification)}
      className={cn(
        'group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all cursor-pointer',
        isUnread
          ? 'border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.07] dark:bg-primary/[0.04] dark:hover:bg-primary/[0.08] shadow-2xs'
          : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border text-card-foreground',
      )}
    >
      {/* Indicator line for unread */}
      {isUnread && (
        <span
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-primary"
          aria-hidden="true"
        />
      )}

      {/* Main Content Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1 pl-1">
        {/* Visual micro-icon */}
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5',
            visuals.iconContainer,
          )}
        >
          <VisualIcon className="size-4" />
        </div>

        {/* Text Container */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Badge
              variant="outline"
              className={cn('h-5 px-1.5 text-[10px] font-semibold', visuals.badgeClass)}
            >
              {visuals.badgeLabel}
            </Badge>

            {notification.isBroadcast && (
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Radio className="size-2.5" />
                Siaran
              </span>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-auto sm:ml-0">
              <Calendar className="size-3 text-muted-foreground/70" />
              <span>{formatDateTime(notification.createdAt)}</span>
            </div>

            {notification.senderName && (
              <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <User className="size-3 text-muted-foreground/60" />
                <span className="truncate max-w-[140px]">{notification.senderName}</span>
              </div>
            )}
          </div>

          {/* Title & Preview */}
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-sm leading-snug truncate',
                isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/85',
              )}
            >
              {notification.title}
            </h3>
            {isUnread && (
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                title="Belum dibaca"
              />
            )}
          </div>

          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {isUnread && onMarkAsRead && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
            title="Tandai telah dibaca"
            disabled={isMarkingRead}
            onClick={() => onMarkAsRead(notification.id)}
          >
            <CheckCheck className="size-3.5 text-primary" />
            <span className="hidden lg:inline">Tandai Dibaca</span>
          </Button>
        )}

        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Hapus notifikasi"
            disabled={isDeleting}
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2.5 gap-1 border-border/70"
          onClick={() => onSelect(notification)}
        >
          <span>Rincian</span>
          <ChevronRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}

'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import type { NotificationResponse } from '@/types/api/notification.types';
import { formatDateTime } from '@/utils/string.format';
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCheck,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Megaphone,
  Radio,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';

export interface NotificationDetailDialogProps {
  notification: NotificationResponse | null;
  open: boolean;
  onClose: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
}

/**
 * Mendapatkan ikon dan style berdasarkan tipe/konten notifikasi
 */
function getNotificationVisuals(notification: NotificationResponse) {
  const code = (notification.typeCode || notification.typeName || '').toUpperCase();
  const text = (notification.title + ' ' + notification.message).toLowerCase();

  if (notification.isBroadcast || code.includes('BROADCAST') || code.includes('ANNOUNCEMENT')) {
    return {
      icon: Megaphone,
      badgeLabel: 'Pengumuman Siaran',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      iconClass: 'text-primary bg-primary/10',
    };
  }

  if (code.includes('WARN') || text.includes('peringatan') || text.includes('ditolak')) {
    return {
      icon: AlertTriangle,
      badgeLabel: notification.typeName || 'Peringatan',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      iconClass: 'text-destructive bg-destructive/10',
    };
  }

  if (text.includes('absensi') || text.includes('koreksi') || text.includes('check-in')) {
    return {
      icon: Clock,
      badgeLabel: notification.typeName || 'Absensi',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconClass: 'text-amber-500 bg-amber-500/10',
    };
  }

  if (text.includes('sertifikat') || text.includes('certificate')) {
    return {
      icon: Award,
      badgeLabel: notification.typeName || 'Sertifikat',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconClass: 'text-emerald-500 bg-emerald-500/10',
    };
  }

  if (text.includes('pengajuan') || text.includes('dokumen') || text.includes('berkas')) {
    return {
      icon: FileText,
      badgeLabel: notification.typeName || 'Pengajuan',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconClass: 'text-blue-500 bg-blue-500/10',
    };
  }

  return {
    icon: Info,
    badgeLabel: notification.typeName || 'Informasi',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    iconClass: 'text-muted-foreground bg-muted',
  };
}

/**
 * Menghasilkan tautan kontekstual yang relevan berdasarkan isi pesan notifikasi
 */
function getRelatedAction(notification: NotificationResponse) {
  const text = (notification.title + ' ' + notification.message).toLowerCase();

  if (text.includes('sertifikat')) {
    return { label: 'Buka Sertifikat', href: '/intern/certificate', icon: Award };
  }
  if (text.includes('absensi') || text.includes('koreksi')) {
    return { label: 'Lihat Absensi', href: '/intern/attendance', icon: Clock };
  }
  if (text.includes('pengajuan') || text.includes('aplikasi') || text.includes('berkas')) {
    return { label: 'Lihat Pengajuan', href: '/intern/application', icon: FileText };
  }
  if (text.includes('panduan') || text.includes('guide')) {
    return { label: 'Buka Panduan', href: '/intern/guide', icon: BookOpen };
  }

  return null;
}

export function NotificationDetailDialog({
  notification,
  open,
  onClose,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationDetailDialogProps) {
  if (!notification) return null;

  const visuals = getNotificationVisuals(notification);
  const VisualIcon = visuals.icon;
  const relatedAction = getRelatedAction(notification);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center gap-3 p-5 border-b bg-muted/20">
          <div className={`p-2.5 rounded-xl shrink-0 ${visuals.iconClass}`}>
            <VisualIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className={`text-[11px] font-semibold ${visuals.badgeClass}`}>
                {visuals.badgeLabel}
              </Badge>
              {notification.isBroadcast && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-primary/5 text-primary border-primary/20 flex items-center gap-1"
                >
                  <Radio className="size-2.5 animate-pulse" />
                  Siaran Global
                </Badge>
              )}
              <Badge
                variant={notification.isRead ? 'secondary' : 'default'}
                className="text-[10px]"
              >
                {notification.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
              </Badge>
            </div>
            <DialogTitle className="text-base font-semibold leading-snug break-words">
              {notification.title}
            </DialogTitle>
          </div>
        </div>

        {/* Dialog Meta & Body */}
        <div className="p-5 flex flex-col gap-4 text-sm max-h-[60vh] overflow-y-auto">
          {/* Metadata bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 truncate">
              <User className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">
                Pengirim: <strong className="text-foreground">{notification.senderName || 'Sistem SIMAD'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span>{formatDateTime(notification.createdAt)}</span>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rincian Informasi
            </span>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card text-card-foreground leading-relaxed whitespace-pre-wrap font-normal text-sm">
              {notification.message}
            </div>
          </div>

          {/* Contextual Link Action */}
          {relatedAction && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2.5 text-xs text-primary font-medium">
                <relatedAction.icon className="size-4 shrink-0" />
                <span>Terdapat halaman terkait untuk pemberitahuan ini</span>
              </div>
              <Button asChild size="sm" variant="default" className="h-7 text-xs gap-1.5" onClick={onClose}>
                <Link href={relatedAction.href}>
                  {relatedAction.label}
                  <ExternalLink className="size-3" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 px-2.5"
                disabled={isDeleting}
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
              >
                <Trash2 className="size-3.5" />
                Hapus
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!notification.isRead && onMarkAsRead && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                disabled={isMarkingRead}
                onClick={() => {
                  onMarkAsRead(notification.id);
                }}
              >
                <CheckCheck className="size-3.5 text-primary" />
                Tandai Dibaca
              </Button>
            )}
            <Button type="button" variant="default" size="sm" className="h-8 text-xs" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

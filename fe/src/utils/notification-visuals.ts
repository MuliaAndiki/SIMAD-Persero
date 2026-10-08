/** Kunci tampilan notifikasi — tanpa JSX, ikon sebagai nama lucide. */
export type NotificationKind =
  | 'broadcast'
  | 'warning'
  | 'attendance'
  | 'certificate'
  | 'submission'
  | 'info';

export interface NotificationVisualInput {
  typeCode?: string | null;
  typeName?: string | null;
  title?: string | null;
  message?: string | null;
  isBroadcast?: boolean | null;
}

export interface NotificationVisuals {
  kind: NotificationKind;
  badgeLabel: string;
  badgeClass: string;
  iconName: string;
}

export interface RelatedAction {
  label: string;
  href: string;
  iconName: string;
}

export function resolveNotificationKind(input: string | NotificationVisualInput): NotificationKind {
  const obj: NotificationVisualInput =
    typeof input === 'string' ? { typeCode: input, title: input, message: input } : input;
  const code = (obj.typeCode || obj.typeName || '').toUpperCase();
  const text = `${obj.title ?? ''} ${obj.message ?? ''}`.toLowerCase();

  if (obj.isBroadcast || code.includes('BROADCAST') || code.includes('ANNOUNCEMENT')) {
    return 'broadcast';
  }
  if (code.includes('WARN') || text.includes('peringatan') || text.includes('ditolak')) {
    return 'warning';
  }
  if (
    text.includes('absensi') ||
    text.includes('koreksi') ||
    text.includes('presensi') ||
    text.includes('check-in')
  ) {
    return 'attendance';
  }
  if (text.includes('sertifikat') || text.includes('certificate')) {
    return 'certificate';
  }
  if (text.includes('pengajuan') || text.includes('berkas') || text.includes('dokumen')) {
    return 'submission';
  }
  return 'info';
}

export function getNotificationVisuals(input: string | NotificationVisualInput): NotificationVisuals {
  const obj: NotificationVisualInput =
    typeof input === 'string' ? { typeCode: input, title: input, message: input } : input;
  const kind = resolveNotificationKind(obj);
  const typeName = obj.typeName || undefined;

  switch (kind) {
    case 'broadcast':
      return {
        kind,
        badgeLabel: 'Pengumuman Siaran',
        badgeClass: 'bg-primary/10 text-primary border-primary/25',
        iconName: 'Megaphone',
      };
    case 'warning':
      return {
        kind,
        badgeLabel: typeName || 'Peringatan',
        badgeClass: 'bg-destructive/10 text-destructive border-destructive/25',
        iconName: 'AlertTriangle',
      };
    case 'attendance':
      return {
        kind,
        badgeLabel: typeName || 'Absensi',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
        iconName: 'Clock',
      };
    case 'certificate':
      return {
        kind,
        badgeLabel: typeName || 'Sertifikat',
        badgeClass:
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        iconName: 'Award',
      };
    case 'submission':
      return {
        kind,
        badgeLabel: typeName || 'Pengajuan',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
        iconName: 'FileText',
      };
    default:
      return {
        kind: 'info',
        badgeLabel: typeName || 'Informasi',
        badgeClass: 'bg-muted text-muted-foreground border-border',
        iconName: 'Info',
      };
  }
}

export function getRelatedAction(
  input: string | Pick<NotificationVisualInput, 'title' | 'message'>,
): RelatedAction | null {
  const text =
    typeof input === 'string'
      ? input.toLowerCase()
      : `${input.title ?? ''} ${input.message ?? ''}`.toLowerCase();

  if (text.includes('sertifikat')) {
    return { label: 'Buka Sertifikat', href: '/intern/certificate', iconName: 'Award' };
  }
  if (text.includes('absensi') || text.includes('koreksi')) {
    return { label: 'Lihat Absensi', href: '/intern/attendance', iconName: 'Clock' };
  }
  if (text.includes('pengajuan') || text.includes('aplikasi') || text.includes('berkas')) {
    return { label: 'Lihat Pengajuan', href: '/intern/application', iconName: 'FileText' };
  }
  if (text.includes('panduan') || text.includes('guide')) {
    return { label: 'Buka Panduan', href: '/intern/guide', iconName: 'BookOpen' };
  }
  return null;
}

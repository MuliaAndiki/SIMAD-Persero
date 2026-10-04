'use client';

import { Badge } from '@/components/atoms/badge';
import {
  getApplicationStatusLabel,
  getAttendanceStatusLabel,
  getInternshipStatusLabel,
} from '@/utils/status-labels';
import {
  Archive,
  CheckCircle2,
  FileBadge,
  FileText,
  Loader,
  type LucideIcon,
  PlayCircle,
  Send,
  XCircle,
} from 'lucide-react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusStyle {
  label: string;
  variant: BadgeVariant;
  className?: string;
  Icon?: LucideIcon;
}

const SUCCESS_CLASS = 'bg-green-600 hover:bg-green-700';
const AMBER_OUTLINE_CLASS = 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600';
const EMERALD_CLASS = 'bg-emerald-600';

const STATUS_STYLES: Record<string, StatusStyle> = {
  PRESENT: {
    label: getAttendanceStatusLabel('PRESENT'),
    variant: 'default',
    className: SUCCESS_CLASS,
    Icon: CheckCircle2,
  },
  COMPLETED: {
    label: getAttendanceStatusLabel('COMPLETED'),
    variant: 'default',
    Icon: CheckCircle2,
  },
  LATE: {
    label: getAttendanceStatusLabel('LATE'),
    variant: 'outline',
    className: AMBER_OUTLINE_CLASS,
  },
  PENDING_REVIEW: { label: getAttendanceStatusLabel('PENDING_REVIEW'), variant: 'secondary' },
  INVALID: { label: getAttendanceStatusLabel('INVALID'), variant: 'destructive', Icon: XCircle },
  ABSENT: { label: getAttendanceStatusLabel('ABSENT'), variant: 'destructive', Icon: XCircle },
  ON_TIME: { label: getAttendanceStatusLabel('ON_TIME'), variant: 'outline' },
  APPROVED: {
    label: getApplicationStatusLabel('APPROVED'),
    variant: 'default',
    className: SUCCESS_CLASS,
    Icon: CheckCircle2,
  },
  REJECTED: { label: getApplicationStatusLabel('REJECTED'), variant: 'destructive', Icon: XCircle },
  SUBMITTED: { label: getApplicationStatusLabel('SUBMITTED'), variant: 'secondary', Icon: Send },
  UNDER_REVIEW: {
    label: getApplicationStatusLabel('UNDER_REVIEW'),
    variant: 'secondary',
    Icon: Send,
  },
  RESUBMITTED: {
    label: getApplicationStatusLabel('RESUBMITTED'),
    variant: 'secondary',
    Icon: Send,
  },
  DRAFT: { label: getApplicationStatusLabel('DRAFT'), variant: 'outline', Icon: FileText },
  ACTIVE: {
    label: getInternshipStatusLabel('ACTIVE'),
    variant: 'default',
    className: SUCCESS_CLASS,
    Icon: PlayCircle,
  },
  PENDING: { label: getInternshipStatusLabel('PENDING'), variant: 'secondary', Icon: Loader },
  CERTIFICATE_GENERATED: {
    label: getInternshipStatusLabel('CERTIFICATE_GENERATED'),
    variant: 'outline',
    Icon: FileBadge,
  },
  ARCHIVED: { label: getInternshipStatusLabel('ARCHIVED'), variant: 'outline', Icon: Archive },
  TERMINATED: {
    label: getInternshipStatusLabel('TERMINATED'),
    variant: 'destructive',
    Icon: XCircle,
  },
  FINAL: { label: 'Nilai Akhir', variant: 'default', className: EMERALD_CLASS, Icon: CheckCircle2 },
  AKTIF: { label: 'Aktif', variant: 'default' },
  NONAKTIF: { label: 'Nonaktif', variant: 'secondary' },
  TERSEDIA: { label: 'Tersedia', variant: 'default', className: EMERALD_CLASS },
  PENUH: { label: 'Penuh', variant: 'destructive' },
  PUBLISHED: { label: 'Diterbitkan', variant: 'default', className: EMERALD_CLASS },
};

export interface StatusBadgeProps {
  status?: string | null;
  active?: boolean | null;
  className?: string;
}

/**
 * StatusBadge — badge status terpusat untuk seluruh tabel.
 * `active` true/false dipetakan ke Aktif/Nonaktif; string status dipetakan
 * ke label + warna baku, fallback outline berisi status mentah.
 */
export function StatusBadge({ status, active, className }: StatusBadgeProps) {
  if (active === true || active === false) {
    return (
      <Badge variant={active ? 'default' : 'secondary'} className={className}>
        {active ? 'Aktif' : 'Nonaktif'}
      </Badge>
    );
  }

  const key = (status ?? '').toUpperCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES[status ?? ''];
  if (!style) {
    return (
      <Badge variant="outline" className={className}>
        {status ?? '-'}
      </Badge>
    );
  }

  const Icon = style.Icon;
  return (
    <Badge variant={style.variant} className={style.className ?? className}>
      {Icon ? <Icon className="size-3" /> : null}
      {style.label}
    </Badge>
  );
}

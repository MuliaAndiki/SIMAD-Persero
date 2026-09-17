import { Badge } from '@/components/atoms/badge';
import { cn } from '@/utils/classname';
import { Archive, CheckCircle2, CircleDashed, FileBadge, Loader, PlayCircle } from 'lucide-react';

/** Label status magang — cocok dengan docs/05-state-machine.md §9. */
export function internshipStatusLabel(status: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ACTIVE':
      return 'Aktif';
    case 'COMPLETED':
      return 'Selesai';
    case 'CERTIFICATE_GENERATED':
      return 'Sertifikat Dibuat';
    case 'ARCHIVED':
      return 'Diarsipkan';
    default:
      return status ?? '-';
  }
}

/**
 * InternshipStatusBadge — badge status magang
 * (PENDING / ACTIVE / COMPLETED / CERTIFICATE_GENERATED / ARCHIVED).
 */
export function InternshipStatusBadge({ status }: { status: string | null }) {
  const active = status === 'ACTIVE';
  const completed = status === 'COMPLETED';
  const pending = status === 'PENDING';
  const archived = status === 'ARCHIVED';
  const generated = status === 'CERTIFICATE_GENERATED';

  const Icon = active
    ? PlayCircle
    : pending
      ? Loader
      : completed
        ? CheckCircle2
        : generated
          ? FileBadge
          : archived
            ? Archive
            : CircleDashed;

  return (
    <Badge
      variant={active ? 'default' : completed ? 'default' : pending ? 'secondary' : 'outline'}
      className={cn(active && 'bg-green-600 hover:bg-green-700')}
    >
      <Icon className="size-3" />
      {internshipStatusLabel(status)}
    </Badge>
  );
}

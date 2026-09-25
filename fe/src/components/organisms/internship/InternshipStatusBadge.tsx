import { Badge } from '@/components/atoms/badge';
import { cn } from '@/utils/classname';
import { getInternshipStatusLabel as internshipStatusLabel } from '@/utils/status-labels';
import { Archive, CheckCircle2, CircleDashed, FileBadge, Loader, PlayCircle } from 'lucide-react';

export { internshipStatusLabel };

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

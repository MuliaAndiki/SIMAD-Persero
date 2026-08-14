import { Badge } from '@/components/atoms/badge';
import { cn } from '@/utils/classname';

function attendanceStatusLabel(status: string | null): string {
  switch (status) {
    case 'PRESENT':
      return 'Hadir';
    case 'LATE':
      return 'Terlambat';
    case 'COMPLETED':
      return 'Selesai';
    case 'PENDING_REVIEW':
      return 'Menunggu Review';
    case 'INVALID':
      return 'Tidak Valid';
    case 'ABSENT':
      return 'Tidak Hadir';
    default:
      return status ?? '-';
  }
}

/**
 * AttendanceStatusBadge — badge status absensi (PRESENT / LATE / COMPLETED /
 * PENDING_REVIEW / INVALID / ABSENT) untuk tabel & detail absensi.
 */
export function AttendanceStatusBadge({ status }: { status: string | null }) {
  const present = status === 'PRESENT';
  const late = status === 'LATE';
  const completed = status === 'COMPLETED';
  const pendingReview = status === 'PENDING_REVIEW';
  const invalid = status === 'INVALID' || status === 'ABSENT';

  return (
    <Badge
      variant={
        invalid
          ? 'destructive'
          : pendingReview
            ? 'secondary'
            : late || completed
              ? 'outline'
              : 'default'
      }
      className={cn(
        present && 'bg-green-600 hover:bg-green-700',
        late && 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600',
      )}
    >
      {attendanceStatusLabel(status)}
    </Badge>
  );
}

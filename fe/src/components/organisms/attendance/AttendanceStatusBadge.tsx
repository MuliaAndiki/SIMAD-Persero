import { Badge } from '@/components/atoms/badge';
import { cn } from '@/utils/classname';
import { getAttendanceStatusLabel as attendanceStatusLabel } from '@/utils/status-labels';

export { attendanceStatusLabel };

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

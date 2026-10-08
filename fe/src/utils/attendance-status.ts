export { getAttendanceStatusLabel } from './status-labels';

export function getAttendanceStatusVariant(
  status: string | null | undefined,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PRESENT':
    case 'COMPLETED':
      return 'default';
    case 'LATE':
    case 'PENDING_REVIEW':
      return 'secondary';
    case 'INVALID':
    case 'ABSENT':
      return 'destructive';
    default:
      return 'outline';
  }
}

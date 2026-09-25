/**
 * Centralized status label mappings and helpers for SIMAD.
 * Eliminates duplicate switch-case / mapping implementations across badges and pages.
 */

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Diajukan',
  UNDER_REVIEW: 'Sedang Direview',
  RESUBMITTED: 'Diajukan Ulang',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

export const INTERNSHIP_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  TERMINATED: 'Diakhiri',
  CERTIFICATE_GENERATED: 'Sertifikat Dibuat',
  ARCHIVED: 'Diarsipkan',
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  ON_TIME: 'Tepat Waktu',
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  COMPLETED: 'Selesai',
  PENDING_REVIEW: 'Menunggu Review',
  INVALID: 'Tidak Valid',
  ABSENT: 'Tidak Hadir',
};

export function getStatusLabel(
  map: Record<string, string>,
  status: string | null | undefined,
  fallback = '-',
): string {
  if (!status) return fallback;
  return map[status] ?? status ?? fallback;
}

export function getApplicationStatusLabel(status: string | null | undefined): string {
  return getStatusLabel(APPLICATION_STATUS_LABELS, status);
}

export function getInternshipStatusLabel(status: string | null | undefined): string {
  return getStatusLabel(INTERNSHIP_STATUS_LABELS, status);
}

export function getAttendanceStatusLabel(status: string | null | undefined): string {
  return getStatusLabel(ATTENDANCE_STATUS_LABELS, status);
}

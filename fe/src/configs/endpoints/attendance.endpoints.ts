/**
 * Daftar endpoint modul Attendance.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/attendanceRoutes.ts).
 */

export const ATTENDANCE_ENDPOINTS = {
  /** POST /attendance/check-in — Check-in kehadiran (INTERN) */
  CHECK_IN: '/attendance/check-in',
  /** POST /attendance/check-out — Check-out kehadiran (INTERN) */
  CHECK_OUT: '/attendance/check-out',
  /** GET /attendance/me — Riwayat kehadiran sendiri (INTERN) */
  MY: '/attendance/me',
  /** GET /attendance/today — Kehadiran hari ini (INTERN) */
  TODAY: '/attendance/today',
  /** GET /attendance/summary — Ringkasan kehadiran (INTERN) */
  SUMMARY: '/attendance/summary',
  /** GET /attendance/supervisor — Dashboard supervisor (SUPERVISOR) */
  SUPERVISOR: '/attendance/supervisor',
  /** GET /attendance/history — Riwayat kehadiran semua (HR_ADMIN) */
  HISTORY: '/attendance/history',
  /** GET /attendance/export — Ekspor data kehadiran (HR_ADMIN) */
  EXPORT: '/attendance/export',
  /** GET /attendance/:attendanceId — Detail kehadiran (HR_ADMIN, SUPERVISOR) */
  DETAIL: (attendanceId: string) => `/attendance/${attendanceId}`,
  /** PATCH /attendance/:attendanceId/override — Override status (SUPERVISOR) */
  OVERRIDE: (attendanceId: string) => `/attendance/${attendanceId}/override`,
} as const;

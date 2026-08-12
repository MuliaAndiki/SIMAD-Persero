/**
 * Daftar endpoint modul Reporting.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/reportingRoutes.ts).
 */

export const REPORTING_ENDPOINTS = {
  /** GET /reports/attendance — Laporan kehadiran (HR_ADMIN) */
  ATTENDANCE: '/reports/attendance',
  /** GET /reports/internships — Laporan magang (HR_ADMIN) */
  INTERNSHIPS: '/reports/internships',
  /** GET /reports/certificates — Laporan sertifikat (HR_ADMIN) */
  CERTIFICATES: '/reports/certificates',
  /** GET /reports/dashboard — Laporan dashboard (HR_ADMIN) */
  DASHBOARD: '/reports/dashboard',
} as const;

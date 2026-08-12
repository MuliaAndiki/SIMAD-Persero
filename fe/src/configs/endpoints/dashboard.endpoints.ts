/**
 * Daftar endpoint modul Dashboard.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/dashboardRoutes.ts).
 */

export const DASHBOARD_ENDPOINTS = {
  /** GET /dashboard/intern — Dashboard intern (INTERN) */
  INTERN: '/dashboard/intern',
  /** GET /dashboard/hr — Dashboard HR (HR_ADMIN) */
  HR: '/dashboard/hr',
  /** GET /dashboard/supervisor — Dashboard supervisor (SUPERVISOR) */
  SUPERVISOR: '/dashboard/supervisor',
  /** GET /dashboard/statistics — Statistik (HR_ADMIN) */
  STATISTICS: '/dashboard/statistics',
  /** GET /dashboard/charts — Data chart (HR_ADMIN) */
  CHARTS: '/dashboard/charts',
  /** GET /dashboard/recent-activities — Aktivitas terbaru (semua role) */
  RECENT_ACTIVITIES: '/dashboard/recent-activities',
} as const;

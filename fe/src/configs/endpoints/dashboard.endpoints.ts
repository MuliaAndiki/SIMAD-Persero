/**
 * Daftar endpoint modul Dashboard.
 *
 * Endpoint dipisah per role — setiap role punya namespace dashboard sendiri
 * (tidak berbagi prefix `/dashboard`), disamakan dengan folder rute frontend
 * `(private)/<ROLE>/dashboard` dan rute backend
 * (be/src/routes/dashboardRoutes.ts):
 * - /intern/dashboard                       (INTERN)
 * - /hr-admin/dashboard                     (HR_ADMIN)
 * - /hr-admin/dashboard/statistics          (HR_ADMIN)
 * - /hr-admin/dashboard/charts              (HR_ADMIN)
 * - /hr-admin/dashboard/recent-activities   (HR_ADMIN)
 * - /supervisor/dashboard                   (SUPERVISOR)
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 */

export const DASHBOARD_ENDPOINTS = {
  /** GET /intern/dashboard — Dashboard intern (INTERN) */
  INTERN: '/intern/dashboard',
  /** GET /hr-admin/dashboard — Dashboard HR (HR_ADMIN) */
  HR: '/hr-admin/dashboard',
  /** GET /supervisor/dashboard — Dashboard supervisor (SUPERVISOR) */
  SUPERVISOR: '/supervisor/dashboard',
  /** GET /receptionist/dashboard — Dashboard receptionist (RECEPTIONIST) */
  RECEPTIONIST: '/receptionist/dashboard',
  /** GET /hr-admin/dashboard/statistics — Statistik (HR_ADMIN) */
  STATISTICS: '/hr-admin/dashboard/statistics',
  /** GET /hr-admin/dashboard/charts — Data chart (HR_ADMIN) */
  CHARTS: '/hr-admin/dashboard/charts',
  /** GET /hr-admin/dashboard/recent-activities — Aktivitas terbaru (HR_ADMIN) */
  RECENT_ACTIVITIES: '/hr-admin/dashboard/recent-activities',
} as const;

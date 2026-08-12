/**
 * Daftar endpoint modul Audit Log.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/auditLogRoutes.ts).
 */

export const AUDIT_LOG_ENDPOINTS = {
  /** GET /audit-logs — Daftar audit log (HR_ADMIN) */
  LIST: '/audit-logs',
  /** GET /audit-logs/users/:userId — Aktivitas user tertentu (HR_ADMIN) */
  USER_ACTIVITY: (userId: string) => `/audit-logs/users/${userId}`,
  /** GET /audit-logs/:auditId — Detail audit log (HR_ADMIN) */
  DETAIL: (auditId: string) => `/audit-logs/${auditId}`,
} as const;

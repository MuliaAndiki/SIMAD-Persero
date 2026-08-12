/**
 * Daftar endpoint modul Institution.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/institutionRoutes.ts).
 */

export const INSTITUTION_ENDPOINTS = {
  /** GET /institutions — Daftar institusi */
  LIST: '/institutions',
  /** GET /institutions/:institutionId — Detail institusi */
  DETAIL: (institutionId: string) => `/institutions/${institutionId}`,
} as const;

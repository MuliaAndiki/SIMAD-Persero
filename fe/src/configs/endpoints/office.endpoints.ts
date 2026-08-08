/**
 * Daftar endpoint modul Office.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/officeRoutes.ts).
 */

export const OFFICE_ENDPOINTS = {
  LIST: '/offices',
  DETAIL: (officeId: string) => `/offices/${officeId}`,
  CREATE: '/offices',
  UPDATE: (officeId: string) => `/offices/${officeId}`,
  DELETE: (officeId: string) => `/offices/${officeId}`,
} as const;

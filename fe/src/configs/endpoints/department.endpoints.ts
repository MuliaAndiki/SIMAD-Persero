/**
 * Daftar endpoint modul Department.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/departmentRoutes.ts).
 */

export const DEPARTMENT_ENDPOINTS = {
  LIST: '/departments',
  DETAIL: (departmentId: string) => `/departments/${departmentId}`,
  CREATE: '/departments',
  UPDATE: (departmentId: string) => `/departments/${departmentId}`,
  DELETE: (departmentId: string) => `/departments/${departmentId}`,
} as const;

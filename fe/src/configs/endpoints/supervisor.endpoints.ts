/**
 * Daftar endpoint modul Supervisor.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/supervisorRoutes.ts).
 */

export const SUPERVISOR_ENDPOINTS = {
  /** GET /supervisors/dashboard — Dashboard supervisor (SUPERVISOR) */
  DASHBOARD: '/supervisors/dashboard',
  /** GET /supervisors — Daftar supervisor (HR_ADMIN) */
  LIST: '/supervisors',
  /** POST /supervisors - Create supervisor (HR_ADMIN) */
  CREATE: '/supervisors',
  /** GET /supervisors/:supervisorId — Detail supervisor (HR_ADMIN) */
  DETAIL: (supervisorId: string) => `/supervisors/${supervisorId}`,
  /** UPDATE /supervisors/:supervisorId - Update supervisor (HR_ADMIN) */
  UPDATE: (supervisorId: string) => `/supervisors/${supervisorId}`,
  /** DELETE /supervisors/:supervisorId - Delete supervisor (HR_ADMIN) */
  DELETE: (supervisorId: string) => `/supervisors/${supervisorId}`,
  /** POST /supervisors/:supervisorId/assign — Assign intern (HR_ADMIN) */
  ASSIGN: (supervisorId: string) => `/supervisors/${supervisorId}/assign`,
  /** DELETE /supervisors/:supervisorId/assignments/:assignmentId — Hapus assignment (HR_ADMIN) */
  REMOVE_ASSIGNMENT: (supervisorId: string, assignmentId: string) =>
    `/supervisors/${supervisorId}/assignments/${assignmentId}`,
} as const;

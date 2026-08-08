/**
 * Daftar endpoint modul Internship.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/internshipRoutes.ts).
 */

export const INTERNSHIP_ENDPOINTS = {
  /** GET /internships/me — Magang saya (INTERN) */
  MY: '/internships/me',
  /** GET /internships/:id — Detail magang (HR_ADMIN, SUPERVISOR) */
  DETAIL: (id: string) => `/internships/${id}`,
  /** PATCH /internships/:id/start — Mulai magang (HR_ADMIN) */
  START: (id: string) => `/internships/${id}/start`,
  /** PATCH /internships/:id/finish — Selesaikan magang (HR_ADMIN) */
  FINISH: (id: string) => `/internships/${id}/finish`,
  /** PATCH /internships/:id/extend — Perpanjang magang (HR_ADMIN) */
  EXTEND: (id: string) => `/internships/${id}/extend`,
  /** PATCH /internships/:id/assign-supervisor — Assign supervisor (HR_ADMIN) */
  ASSIGN_SUPERVISOR: (id: string) => `/internships/${id}/assign-supervisor`,
  /** PATCH /internships/:id/change-department — Pindah departemen (HR_ADMIN) */
  CHANGE_DEPARTMENT: (id: string) => `/internships/${id}/change-department`,
  /** PATCH /internships/:id/archive — Arsipkan magang (HR_ADMIN) */
  ARCHIVE: (id: string) => `/internships/${id}/archive`,
} as const;

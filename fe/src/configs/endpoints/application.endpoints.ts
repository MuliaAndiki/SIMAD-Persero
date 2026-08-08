/**
 * Daftar endpoint modul Application.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/applicationRoutes.ts).
 */

export const APPLICATION_ENDPOINTS = {
  /** POST /applications — Buat lamaran baru (INTERN) */
  CREATE: '/applications',
  /** GET /applications/me — Daftar lamaran sendiri (INTERN) */
  MY: '/applications/me',
  /** PATCH /applications/:id — Update draft (INTERN) */
  UPDATE: (id: string) => `/applications/${id}`,
  /** POST /applications/:id/submit — Kirim lamaran (INTERN) */
  SUBMIT: (id: string) => `/applications/${id}/submit`,
  /** POST /applications/:id/cancel — Batalkan lamaran (INTERN) */
  CANCEL: (id: string) => `/applications/${id}/cancel`,
  /** DELETE /applications/:id — Hapus draft (INTERN) */
  DELETE: (id: string) => `/applications/${id}`,
  /** GET /applications — Daftar seluruh lamaran (HR_ADMIN) */
  LIST: '/applications',
  /** GET /applications/:id — Detail lamaran (HR_ADMIN, SUPERVISOR) */
  DETAIL: (id: string) => `/applications/${id}`,
  /** PATCH /applications/:id/approve — Setujui lamaran (HR_ADMIN) */
  APPROVE: (id: string) => `/applications/${id}/approve`,
  /** PATCH /applications/:id/reject — Tolak lamaran (HR_ADMIN) */
  REJECT: (id: string) => `/applications/${id}/reject`,
} as const;

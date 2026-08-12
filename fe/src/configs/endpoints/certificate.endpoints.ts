/**
 * Daftar endpoint modul Certificate.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/certificateRoutes.ts).
 */

export const CERTIFICATE_ENDPOINTS = {
  /** GET /certificates/verify/:verificationCode — Verifikasi publik (PUBLIC) */
  VERIFY: (verificationCode: string) => `/certificates/verify/${verificationCode}`,
  /** GET /certificates/me — Sertifikat milik intern (INTERN) */
  MY: '/certificates/me',
  /** POST /certificates/generate — Generate sertifikat (HR_ADMIN) */
  GENERATE: '/certificates/generate',
  /** GET /certificates/:certificateId/download — Unduh sertifikat */
  DOWNLOAD: (certificateId: string) => `/certificates/${certificateId}/download`,
  /** GET /certificates/:certificateId — Detail sertifikat */
  DETAIL: (certificateId: string) => `/certificates/${certificateId}`,
  /** POST /certificates/:certificateId/regenerate — Regenerate sertifikat (HR_ADMIN) */
  REGENERATE: (certificateId: string) => `/certificates/${certificateId}/regenerate`,
} as const;

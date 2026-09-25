/**
 * Daftar endpoint modul Certificate.
 */

export const CERTIFICATE_ENDPOINTS = {
  /** GET /certificates/verify/:verificationCode — Verifikasi publik (PUBLIC) */
  VERIFY: (verificationCode: string) => `/certificates/verify/${verificationCode}`,
  /** GET /certificates/me — Sertifikat milik intern (INTERN) */
  MY: '/certificates/me',
  /** GET /certificates — List all certificates (HR_ADMIN) */
  LIST: '/certificates',
  /** GET /certificates/pending-approval — Pending approval list (HR_ADMIN) */
  PENDING_APPROVAL: '/certificates/pending-approval',
  /** PATCH /certificates/:id/approve — Approve certificate (HR_ADMIN) */
  APPROVE: (id: string) => `/certificates/${id}/approve`,
  /** PATCH /certificates/:id/reject — Reject certificate (HR_ADMIN) */
  REJECT: (id: string) => `/certificates/${id}/reject`,
  /** POST /certificates/generate — Generate sertifikat (HR_ADMIN) */
  GENERATE: '/certificates/generate',
  /** GET /certificates/:certificateId/download — Unduh sertifikat */
  DOWNLOAD: (certificateId: string) => `/certificates/${certificateId}/download`,
  /** GET /certificates/:certificateId — Detail sertifikat */
  DETAIL: (certificateId: string) => `/certificates/${certificateId}`,
  /** GET /certificates/me/download — Unduh sertifikat milik intern langsung */
  DOWNLOAD_MY: '/certificates/me/download',
  /** Certificate Settings (general / per-office) */
  SETTINGS: '/certificate-settings',
  /** CRUD Office Certificate Settings */
  OFFICE_SETTINGS_LIST: '/certificate-settings',
  OFFICE_SETTING_DETAIL: (officeLocationId: string) => `/certificate-settings/${officeLocationId}`,
  OFFICE_SETTING_CREATE: '/certificate-settings',
  OFFICE_SETTING_UPDATE: (id: string) => `/certificate-settings/${id}`,
} as const;


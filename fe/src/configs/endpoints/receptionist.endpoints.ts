export const RECEPTIONIST_ENDPOINTS = {
  /** GET /receptionists — Daftar resepsionis (HR_ADMIN) */
  LIST: '/receptionists',
  /** POST /receptionists - Create resepsionis (HR_ADMIN) */
  CREATE: '/receptionists',
  /** GET /receptionists/:receptionistId — Detail resepsionis (HR_ADMIN) */
  DETAIL: (receptionistId: string) => `/receptionists/${receptionistId}`,
  /** PATCH /receptionists/:receptionistId - Update resepsionis (HR_ADMIN) */
  UPDATE: (receptionistId: string) => `/receptionists/${receptionistId}`,
  /** DELETE /receptionists/:receptionistId - Delete resepsionis (HR_ADMIN) */
  DELETE: (receptionistId: string) => `/receptionists/${receptionistId}`,
} as const;

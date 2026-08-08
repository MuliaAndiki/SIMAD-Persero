/**
 * Daftar endpoint modul Notification.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/notificationRoutes.ts).
 */

export const NOTIFICATION_ENDPOINTS = {
  /** GET /notifications — Daftar notifikasi saya */
  LIST: '/notifications',
  /** GET /notifications/unread-count — Jumlah belum dibaca */
  UNREAD_COUNT: '/notifications/unread-count',
  /** PATCH /notifications/read-all — Tandai semua dibaca */
  READ_ALL: '/notifications/read-all',
  /** POST /notifications/send — Kirim notifikasi (HR_ADMIN) */
  SEND: '/notifications/send',
  /** GET /notifications/:notificationId — Detail notifikasi */
  DETAIL: (notificationId: string) => `/notifications/${notificationId}`,
  /** PATCH /notifications/:notificationId/read — Tandai dibaca */
  READ: (notificationId: string) => `/notifications/${notificationId}/read`,
  /** DELETE /notifications/:notificationId — Hapus notifikasi */
  DELETE: (notificationId: string) => `/notifications/${notificationId}`,
} as const;

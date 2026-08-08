/**
 * Tipe payload & respons modul Notification.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/notification.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/NotificationController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

export interface NotificationQuery {
  page?: number;
  limit?: number;
}

export interface SendNotificationBody {
  typeCode?: string;
  title: string;
  message: string;
  isBroadcast?: boolean;
  userIds?: string[];
}

export interface NotificationParams {
  notificationId: string;
}

// ---------- Response (data dari backend) ----------

/** Data satu notifikasi hasil serialisasi backend. */
export interface NotificationResponse {
  id: string;
  typeId: string;
  typeCode: string | null;
  typeName: string;
  title: string;
  message: string;
  isBroadcast: boolean;
  senderId: string;
  senderName: string | null;
  createdAt: string;
  readAt: string | null;
  isRead: boolean;
}

/** Jumlah notifikasi belum dibaca (GET /notifications/unread-count). */
export interface UnreadCountResponse {
  count: number;
}

/** Hasil tandai semua terbaca (PATCH /notifications/read-all). */
export interface ReadAllResponse {
  count: number;
}

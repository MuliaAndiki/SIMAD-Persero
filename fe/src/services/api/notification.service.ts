import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { NOTIFICATION_ENDPOINTS } from '@/configs/endpoints/notification.endpoints';
import type {
  NotificationParams,
  NotificationQuery,
  NotificationResponse,
  ReadAllResponse,
  SendNotificationBody,
  UnreadCountResponse,
} from '@/types/api/notification.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Notification — 7 method, satu method per endpoint backend
 * (be/src/routes/notificationRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class NotificationService {
  /**
   * GET /notifications
   * Mengambil daftar notifikasi saya.
   */
  public async List(query?: NotificationQuery): Promise<TResponse<NotificationResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<NotificationResponse[]>(
      `${NOTIFICATION_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar notifikasi berhasil dimuat',
    });
  }

  /**
   * GET /notifications/unread-count
   * Mengambil jumlah notifikasi belum dibaca.
   */
  public async UnreadCount(): Promise<TResponse<UnreadCountResponse>> {
    const res = await client.GetResponse<UnreadCountResponse>(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
    return toServiceResponse(res, {
      message: 'Jumlah notifikasi belum dibaca berhasil dimuat',
    });
  }

  /**
   * PATCH /notifications/read-all
   * Menandai semua notifikasi sebagai sudah dibaca.
   */
  public async ReadAll(): Promise<TResponse<ReadAllResponse>> {
    const res = await client.PatchResponse<ReadAllResponse>(NOTIFICATION_ENDPOINTS.READ_ALL, {});
    return toServiceResponse(res, {
      message: 'Semua notifikasi berhasil ditandai dibaca',
    });
  }

  /**
   * POST /notifications/send
   * Mengirim notifikasi baru (HR_ADMIN).
   */
  public async Send(
    body: Pick<SendNotificationBody, 'typeCode' | 'title' | 'message' | 'isBroadcast' | 'userIds'>,
  ): Promise<TResponse<NotificationResponse>> {
    const res = await client.PostResponse<NotificationResponse>(NOTIFICATION_ENDPOINTS.SEND, body);
    return toServiceResponse(res, {
      message: 'Notifikasi berhasil dikirim',
      statusCode: 201,
    });
  }

  /**
   * GET /notifications/:notificationId
   * Mengambil detail notifikasi.
   */
  public async Detail(
    params: Pick<NotificationParams, 'notificationId'>,
  ): Promise<TResponse<NotificationResponse>> {
    const res = await client.GetResponse<NotificationResponse>(
      NOTIFICATION_ENDPOINTS.DETAIL(params.notificationId),
    );
    return toServiceResponse(res, {
      message: 'Detail notifikasi berhasil dimuat',
    });
  }

  /**
   * PATCH /notifications/:notificationId/read
   * Menandai satu notifikasi sebagai sudah dibaca.
   */
  public async Read(
    params: Pick<NotificationParams, 'notificationId'>,
  ): Promise<TResponse<NotificationResponse>> {
    const res = await client.PatchResponse<NotificationResponse>(
      NOTIFICATION_ENDPOINTS.READ(params.notificationId),
      {},
    );
    return toServiceResponse(res, {
      message: 'Notifikasi berhasil ditandai dibaca',
    });
  }

  /**
   * DELETE /notifications/:notificationId
   * Menghapus notifikasi.
   */
  public async Delete(
    params: Pick<NotificationParams, 'notificationId'>,
  ): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(
      NOTIFICATION_ENDPOINTS.DELETE(params.notificationId),
    );
    return toServiceResponse(res, { message: 'Notifikasi berhasil dihapus' });
  }
}

export default new NotificationService();

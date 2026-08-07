import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import notificationService from '@/services/notification.service';
import type { NotificationQuery, SendNotificationBody } from '@/types/notification.types';

/**
 * Thin controller modul Notification.
 * Seluruh logika bisnis didelegasikan ke NotificationService.
 * Sumber aturan: docs/07-api-specification.md §18.
 */
class NotificationController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /notifications
  public async getMyNotifications(c: AppContext) {
    try {
      const query = c.query as unknown as NotificationQuery;
      const result = await notificationService.getMyNotifications(c.user!.id, query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /notifications/:notificationId
  public async getById(c: AppContext) {
    try {
      const data = await notificationService.getById(c.user!.id, c.params.notificationId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /notifications/:notificationId/read
  public async markAsRead(c: AppContext) {
    try {
      const data = await notificationService.markAsRead(c.user!.id, c.params.notificationId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /notifications/read-all
  public async markAllAsRead(c: AppContext) {
    try {
      const data = await notificationService.markAllAsRead(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /notifications/:notificationId
  public async remove(c: AppContext) {
    try {
      const data = await notificationService.remove(c.user!.id, c.params.notificationId);
      return HttpResponse(c).ok(data, undefined, 'Notifikasi berhasil dihapus.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /notifications/unread-count
  public async unreadCount(c: AppContext) {
    try {
      const data = await notificationService.unreadCount(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /notifications/send
  public async send(c: AppContext) {
    try {
      const body = c.body as unknown as SendNotificationBody;
      const data = await notificationService.send(c.user!.id, body);
      return HttpResponse(c).created(data, 'Notifikasi berhasil dikirim.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new NotificationController();

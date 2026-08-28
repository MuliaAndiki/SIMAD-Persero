import type { AppContext } from '@/contex';
import notificationController from '@/controllers/NotificationController';
import {
  NotificationIdParam,
  NotificationListQuery,
  SendNotificationDto,
} from '@/dtos/notification.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Notification.
 * Base URL: /notifications
 * Source: docs/07-api-specification.md §18
 */
class NotificationRouter {
  public notificationRouter;

  constructor() {
    this.notificationRouter = new Elysia({ prefix: '/notifications' });
    this.routes();
  }

  private routes() {
    // ─── Static Routes (must be before dynamic /:notificationId) ─────

    // 18.1 GET /notifications (all authenticated roles)
    this.notificationRouter.get(
      '/',
      (c: AppContext) => notificationController.getMyNotifications(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
        query: NotificationListQuery,
      },
    );

    // 18.6 GET /notifications/unread-count (all authenticated roles)
    this.notificationRouter.get(
      '/unread-count',
      (c: AppContext) => notificationController.unreadCount(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
      },
    );

    // 18.4 PATCH /notifications/read-all (all authenticated roles)
    this.notificationRouter.patch(
      '/read-all',
      (c: AppContext) => notificationController.markAllAsRead(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
      },
    );

    // 18.7 POST /notifications/send (HR_ADMIN)
    this.notificationRouter.post('/send', (c: AppContext) => notificationController.send(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      body: SendNotificationDto,
    });

    // ─── Dynamic Routes ───────────────────────────────────────────────

    // 18.2 GET /notifications/:notificationId (all authenticated roles)
    this.notificationRouter.get(
      '/:notificationId',
      (c: AppContext) => notificationController.getById(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
        params: NotificationIdParam,
      },
    );

    // 18.3 PATCH /notifications/:notificationId/read (all authenticated roles)
    this.notificationRouter.patch(
      '/:notificationId/read',
      (c: AppContext) => notificationController.markAsRead(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
        params: NotificationIdParam,
      },
    );

    // 18.5 DELETE /notifications/:notificationId (all authenticated roles)
    this.notificationRouter.delete(
      '/:notificationId',
      (c: AppContext) => notificationController.remove(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['intern', 'hr_admin', 'supervisor', 'receptionist']).beforeHandle,
        ],
        params: NotificationIdParam,
      },
    );
  }
}

export default new NotificationRouter().notificationRouter;

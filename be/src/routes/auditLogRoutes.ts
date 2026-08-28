import type { AppContext } from '@/contex';
import auditLogController from '@/controllers/AuditLogController';
import { AuditLogIdParam, AuditLogQuery, AuditLogUserIdParam } from '@/dtos/auditLog.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Audit Log.
 * Base URL: /audit-logs
 * Source: docs/07-api-specification.md §27
 */
class AuditLogRouter {
  public auditLogRouter;

  constructor() {
    this.auditLogRouter = new Elysia({ prefix: '/audit-logs' });
    this.routes();
  }

  private routes() {
    // 27.1 GET /audit-logs (HR_ADMIN)
    this.auditLogRouter.get('/', (c: AppContext) => auditLogController.list(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      query: AuditLogQuery,
    });

    // ─── Static segment sebelum dynamic /:auditId ──────────────────────

    // 27.3 GET /audit-logs/users/:userId (HR_ADMIN)
    this.auditLogRouter.get(
      '/users/:userId',
      (c: AppContext) => auditLogController.getUserActivity(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: AuditLogUserIdParam,
        query: AuditLogQuery,
      },
    );

    // 27.2 GET /audit-logs/:auditId (HR_ADMIN)
    this.auditLogRouter.get('/:auditId', (c: AppContext) => auditLogController.getById(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      params: AuditLogIdParam,
    });
  }
}

export default new AuditLogRouter().auditLogRouter;

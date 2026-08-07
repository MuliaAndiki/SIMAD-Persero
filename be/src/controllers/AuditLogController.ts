import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import auditLogService from '@/services/auditLog.service';
import type { AuditLogQuery } from '@/types/auditLog.types';

/**
 * Thin controller modul Audit Log.
 * Seluruh logika bisnis didelegasikan ke AuditLogService.
 * Sumber aturan: docs/07-api-specification.md §27.
 */
class AuditLogController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /audit-logs
  public async list(c: AppContext) {
    try {
      const query = (c.query ?? {}) as unknown as AuditLogQuery;
      const result = await auditLogService.list(query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /audit-logs/:auditId
  public async getById(c: AppContext) {
    try {
      const { auditId } = c.params as { auditId: string };
      const data = await auditLogService.getById(auditId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /audit-logs/users/:userId
  public async getUserActivity(c: AppContext) {
    try {
      const { userId } = c.params as { userId: string };
      const query = (c.query ?? {}) as unknown as AuditLogQuery;
      const result = await auditLogService.getUserActivity(userId, query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new AuditLogController();

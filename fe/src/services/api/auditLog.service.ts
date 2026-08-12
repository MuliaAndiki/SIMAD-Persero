import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { AUDIT_LOG_ENDPOINTS } from '@/configs/endpoints/auditLog.endpoints';
import type {
  AuditLogParams,
  AuditLogQuery,
  AuditLogResponse,
  AuditLogUserParams,
} from '@/types/api/auditLog.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Audit Log — 3 method, satu method per endpoint backend
 * (be/src/routes/auditLogRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class AuditLogService {
  /**
   * GET /audit-logs
   * Mengambil daftar audit log dengan pagination dan filter (HR_ADMIN).
   */
  public async List(query?: AuditLogQuery): Promise<TResponse<AuditLogResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AuditLogResponse[]>(`${AUDIT_LOG_ENDPOINTS.LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar audit log berhasil dimuat',
    });
  }

  /**
   * GET /audit-logs/users/:userId
   * Mengambil aktivitas user tertentu (HR_ADMIN).
   */
  public async UserActivity(
    params: Pick<AuditLogUserParams, 'userId'>,
    query?: AuditLogQuery,
  ): Promise<TResponse<AuditLogResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AuditLogResponse[]>(
      `${AUDIT_LOG_ENDPOINTS.USER_ACTIVITY(params.userId)}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Aktivitas user berhasil dimuat',
    });
  }

  /**
   * GET /audit-logs/:auditId
   * Mengambil detail satu audit log (HR_ADMIN).
   */
  public async Detail(
    params: Pick<AuditLogParams, 'auditId'>,
  ): Promise<TResponse<AuditLogResponse>> {
    const res = await client.GetResponse<AuditLogResponse>(
      AUDIT_LOG_ENDPOINTS.DETAIL(params.auditId),
    );
    return toServiceResponse(res, {
      message: 'Detail audit log berhasil dimuat',
    });
  }
}

export default new AuditLogService();

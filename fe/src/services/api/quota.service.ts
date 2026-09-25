import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { QUOTA_ENDPOINTS } from '@/configs/endpoints/quota.endpoints';
import type {
  CreateQuotaBody,
  QuotaAvailabilityQuery,
  QuotaAvailabilityResult,
  QuotaItem,
  QuotaQuery,
  UpdateQuotaBody,
} from '@/types/api/quota.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class QuotaService {
  /**
   * GET /internship-quotas
   */
  public async List(query?: QuotaQuery): Promise<TResponse<QuotaItem[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<QuotaItem[]>(`${QUOTA_ENDPOINTS.LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar kuota magang berhasil dimuat',
    });
  }

  /**
   * GET /internship-quotas/availability
   */
  public async CheckAvailability(
    query: QuotaAvailabilityQuery,
  ): Promise<TResponse<QuotaAvailabilityResult>> {
    const qs = buildQueryString(query as unknown as Record<string, string | number | boolean>);
    const res = await client.GetResponse<QuotaAvailabilityResult>(
      `${QUOTA_ENDPOINTS.AVAILABILITY}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Ketersediaan slot kuota berhasil diperiksa',
    });
  }

  /**
   * GET /internship-quotas/:id
   */
  public async Detail(id: string): Promise<TResponse<QuotaItem>> {
    const res = await client.GetResponse<QuotaItem>(QUOTA_ENDPOINTS.DETAIL(id));
    return toServiceResponse(res, {
      message: 'Detail kuota magang berhasil dimuat',
    });
  }

  /**
   * POST /internship-quotas
   */
  public async Create(body: CreateQuotaBody): Promise<TResponse<QuotaItem>> {
    const res = await client.PostResponse<QuotaItem>(QUOTA_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Alokasi kuota magang berhasil dibuat',
      statusCode: 201,
    });
  }

  /**
   * PATCH /internship-quotas/:id
   */
  public async Update(id: string, body: UpdateQuotaBody): Promise<TResponse<QuotaItem>> {
    const res = await client.PatchResponse<QuotaItem>(QUOTA_ENDPOINTS.UPDATE(id), body);
    return toServiceResponse(res, {
      message: 'Alokasi kuota magang berhasil diperbarui',
    });
  }

  /**
   * DELETE /internship-quotas/:id
   */
  public async Delete(id: string): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(QUOTA_ENDPOINTS.DELETE(id));
    return toServiceResponse(res, {
      message: 'Alokasi kuota magang berhasil dihapus',
    });
  }
}

export default new QuotaService();

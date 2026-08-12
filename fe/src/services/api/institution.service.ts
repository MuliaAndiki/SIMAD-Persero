import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { INSTITUTION_ENDPOINTS } from '@/configs/endpoints/institution.endpoints';
import type {
  InstitutionParams,
  InstitutionQuery,
  InstitutionResponse,
} from '@/types/api/institution.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Institution — 2 method, satu method per endpoint backend
 * (be/src/routes/institutionRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class InstitutionService {
  /**
   * GET /institutions
   * Mengambil daftar institusi dengan pagination dan pencarian.
   */
  public async List(query?: InstitutionQuery): Promise<TResponse<InstitutionResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<InstitutionResponse[]>(
      `${INSTITUTION_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar institusi berhasil dimuat',
    });
  }

  /**
   * GET /institutions/:institutionId
   * Mengambil detail satu institusi.
   */
  public async Detail(
    params: Pick<InstitutionParams, 'institutionId'>,
  ): Promise<TResponse<InstitutionResponse>> {
    const res = await client.GetResponse<InstitutionResponse>(
      INSTITUTION_ENDPOINTS.DETAIL(params.institutionId),
    );
    return toServiceResponse(res, {
      message: 'Detail institusi berhasil dimuat',
    });
  }
}

export default new InstitutionService();

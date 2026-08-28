import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { INSTITUTION_ENDPOINTS } from '@/configs/endpoints/institution.endpoints';
import type {
  EducationLevelResponse,
  InstitutionParams,
  InstitutionQuery,
  InstitutionResponse,
} from '@/types/api/institution.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

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
   * GET /institutions/education-levels
   * Mengambil daftar tingkat pendidikan.
   */
  public async EducationLevels(): Promise<TResponse<EducationLevelResponse[]>> {
    const res = await client.GetResponse<EducationLevelResponse[]>(
      INSTITUTION_ENDPOINTS.EDUCATION_LEVELS,
    );
    return toServiceResponse(res, {
      message: 'Daftar tingkat pendidikan berhasil dimuat',
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

  /**
   * POST /institutions
   * Menambahkan institusi baru (HR_ADMIN).
   */
  public async Create(payload: {
    name: string;
    shortName?: string;
    educationLevelId?: string;
    province?: string;
    city?: string;
    logo?: string;
  }): Promise<TResponse<InstitutionResponse>> {
    const res = await client.PostResponse<InstitutionResponse>(
      INSTITUTION_ENDPOINTS.CREATE,
      payload,
    );
    return toServiceResponse(res, {
      message: 'Institusi berhasil ditambahkan',
    });
  }

  /**
   * PUT /institutions/:institutionId
   * Perbarui data institusi (HR_ADMIN).
   */
  public async Update(
    params: Pick<InstitutionParams, 'institutionId'>,
    payload: {
      name?: string;
      shortName?: string;
      educationLevelId?: string;
      province?: string;
      city?: string;
      logo?: string;
    },
  ): Promise<TResponse<InstitutionResponse>> {
    const res = await client.PutResponse<InstitutionResponse>(
      INSTITUTION_ENDPOINTS.UPDATE(params.institutionId),
      payload,
    );
    return toServiceResponse(res, {
      message: 'Institusi berhasil diperbarui',
    });
  }

  /**
   * DELETE /institutions/:institutionId
   * Hapus institusi (HR_ADMIN).
   */
  public async Delete(
    params: Pick<InstitutionParams, 'institutionId'>,
  ): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(
      INSTITUTION_ENDPOINTS.DELETE(params.institutionId),
    );
    return toServiceResponse(res, {
      message: 'Institusi berhasil dihapus',
    });
  }
}

export default new InstitutionService();

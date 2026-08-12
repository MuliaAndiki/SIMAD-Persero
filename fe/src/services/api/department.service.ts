import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { DEPARTMENT_ENDPOINTS } from '@/configs/endpoints/department.endpoints';
import type {
  CreateDepartmentBody,
  DepartmentParams,
  DepartmentQuery,
  DepartmentResponse,
  UpdateDepartmentBody,
} from '@/types/api/department.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Department — 5 method, satu method per endpoint backend
 * (be/src/routes/departmentRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class DepartmentService {
  /**
   * GET /departments
   * Mengambil daftar departemen dengan pagination dan filter.
   */
  public async List(query?: DepartmentQuery): Promise<TResponse<DepartmentResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<DepartmentResponse[]>(`${DEPARTMENT_ENDPOINTS.LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar departemen berhasil dimuat',
    });
  }

  /**
   * GET /departments/:departmentId
   * Mengambil detail satu departemen.
   */
  public async Detail(
    params: Pick<DepartmentParams, 'departmentId'>,
  ): Promise<TResponse<DepartmentResponse>> {
    const res = await client.GetResponse<DepartmentResponse>(
      DEPARTMENT_ENDPOINTS.DETAIL(params.departmentId),
    );
    return toServiceResponse(res, {
      message: 'Detail departemen berhasil dimuat',
    });
  }

  /**
   * POST /departments
   * Membuat departemen baru.
   */
  public async Create(
    body: Pick<CreateDepartmentBody, 'code' | 'name' | 'description'>,
  ): Promise<TResponse<DepartmentResponse>> {
    const res = await client.PostResponse<DepartmentResponse>(DEPARTMENT_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Departemen berhasil dibuat',
      statusCode: 201,
    });
  }

  /**
   * PATCH /departments/:departmentId
   * Memperbarui data departemen.
   */
  public async Update(
    params: Pick<DepartmentParams, 'departmentId'>,
    body: UpdateDepartmentBody,
  ): Promise<TResponse<DepartmentResponse>> {
    const res = await client.PatchResponse<DepartmentResponse>(
      DEPARTMENT_ENDPOINTS.UPDATE(params.departmentId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Departemen berhasil diperbarui',
    });
  }

  /**
   * DELETE /departments/:departmentId
   * Menonaktifkan departemen (soft delete).
   */
  public async Delete(params: Pick<DepartmentParams, 'departmentId'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(DEPARTMENT_ENDPOINTS.DELETE(params.departmentId));
    return toServiceResponse(res, { message: 'Departemen berhasil dihapus' });
  }
}

export default new DepartmentService();

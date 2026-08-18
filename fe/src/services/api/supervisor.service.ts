import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { SUPERVISOR_ENDPOINTS } from '@/configs/endpoints/supervisor.endpoints';
import type { IUser } from '@/types/api/model.type';
import type {
  AssignInternBody,
  CreateSupervisorBody,
  SupervisorAssignmentParams,
  SupervisorAssignmentResponse,
  SupervisorDashboardResponse,
  SupervisorDetailResponse,
  SupervisorParams,
  SupervisorQuery,
  SupervisorResponse,
  UpdateSupervisorBody,
} from '@/types/api/supervisor.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Supervisor — 5 method, satu method per endpoint backend
 * (be/src/routes/supervisorRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class SupervisorService {
  /**
   * GET /supervisors/dashboard
   * Mengambil dashboard supervisor (SUPERVISOR).
   */
  public async Dashboard(): Promise<TResponse<SupervisorDashboardResponse>> {
    const res = await client.GetResponse<SupervisorDashboardResponse>(
      SUPERVISOR_ENDPOINTS.DASHBOARD,
    );
    return toServiceResponse(res, {
      message: 'Dashboard supervisor berhasil dimuat',
    });
  }

  /**
   * GET /supervisors
   * Mengambil daftar supervisor dengan pagination dan filter (HR_ADMIN).
   */
  public async List(query?: SupervisorQuery): Promise<TResponse<SupervisorResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<SupervisorResponse[]>(`${SUPERVISOR_ENDPOINTS.LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar supervisor berhasil dimuat',
    });
  }

  /**
   * GET /supervisors/:supervisorId
   * Mengambil detail supervisor (HR_ADMIN).
   */
  public async Detail(
    params: Pick<SupervisorParams, 'supervisorId'>,
  ): Promise<TResponse<SupervisorDetailResponse>> {
    const res = await client.GetResponse<SupervisorDetailResponse>(
      SUPERVISOR_ENDPOINTS.DETAIL(params.supervisorId),
    );
    return toServiceResponse(res, {
      message: 'Detail supervisor berhasil dimuat',
    });
  }

  /**
   * POST /supervisors/:supervisorId/assign
   * Menugaskan intern ke supervisor (HR_ADMIN).
   */
  public async Assign(
    params: Pick<SupervisorParams, 'supervisorId'>,
    body: Pick<AssignInternBody, 'internshipId'>,
  ): Promise<TResponse<SupervisorAssignmentResponse>> {
    const res = await client.PostResponse<SupervisorAssignmentResponse>(
      SUPERVISOR_ENDPOINTS.ASSIGN(params.supervisorId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Intern berhasil ditugaskan',
      statusCode: 201,
    });
  }

  /**
   * DELETE /supervisors/:supervisorId/assignments/:assignmentId
   * Menghapus penugasan supervisor (HR_ADMIN).
   */
  public async RemoveAssignment(
    params: Pick<SupervisorAssignmentParams, 'supervisorId' | 'assignmentId'>,
  ): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(
      SUPERVISOR_ENDPOINTS.REMOVE_ASSIGNMENT(params.supervisorId, params.assignmentId),
    );
    return toServiceResponse(res, { message: 'Penugasan berhasil dihapus' });
  }

  /**
   * POST /supervisors
   * Membuat akun supervisor baru beserta profile-nya (HR_ADMIN).
   */
  public async Create(body: CreateSupervisorBody): Promise<TResponse<IUser>> {
    const res = await client.PostResponse<IUser>(SUPERVISOR_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Akun supervisor berhasil dibuat',
      statusCode: 201,
    });
  }

  /**
   * PATCH /supervisors/:supervisorId
   * Memperbarui data akun supervisor (HR_ADMIN).
   */
  public async Update(
    params: Pick<SupervisorParams, 'supervisorId'>,
    body: UpdateSupervisorBody,
  ): Promise<TResponse<IUser>> {
    const res = await client.PatchResponse<IUser>(
      SUPERVISOR_ENDPOINTS.UPDATE(params.supervisorId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Akun supervisor berhasil diperbarui',
    });
  }

  /**
   * DELETE /supervisors/:supervisorId
   * Menghapus (soft delete/disable) akun supervisor (HR_ADMIN).
   */
  public async Delete(params: Pick<SupervisorParams, 'supervisorId'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(SUPERVISOR_ENDPOINTS.DELETE(params.supervisorId));
    return toServiceResponse(res, {
      message: 'Akun supervisor berhasil dihapus',
    });
  }
}

export default new SupervisorService();

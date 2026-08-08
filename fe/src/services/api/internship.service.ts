import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { INTERNSHIP_ENDPOINTS } from '@/configs/endpoints/internship.endpoints';
import type {
  AssignSupervisorBody,
  ChangeDepartmentBody,
  ExtendInternshipBody,
  InternshipParams,
  InternshipResponse,
} from '@/types/api/internship.types';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Internship — 8 method, satu method per endpoint backend
 * (be/src/routes/internshipRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class InternshipService {
  /**
   * GET /internships/me
   * Mengambil data magang milik sendiri (INTERN).
   */
  public async My(): Promise<TResponse<InternshipResponse>> {
    const res = await client.GetResponse<InternshipResponse>(INTERNSHIP_ENDPOINTS.MY);
    return toServiceResponse(res, { message: 'Data magang berhasil dimuat' });
  }

  /**
   * GET /internships/:id
   * Mengambil detail magang (HR_ADMIN, SUPERVISOR).
   */
  public async Detail(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.GetResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.DETAIL(params.id),
    );
    return toServiceResponse(res, { message: 'Detail magang berhasil dimuat' });
  }

  /**
   * PATCH /internships/:id/start
   * Memulai magang (HR_ADMIN).
   */
  public async Start(params: Pick<InternshipParams, 'id'>): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.START(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil dimulai' });
  }

  /**
   * PATCH /internships/:id/finish
   * Menyelesaikan magang (HR_ADMIN).
   */
  public async Finish(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.FINISH(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil diselesaikan' });
  }

  /**
   * PATCH /internships/:id/extend
   * Memperpanjang magang (HR_ADMIN).
   */
  public async Extend(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<ExtendInternshipBody, 'newEndDate' | 'reason'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.EXTEND(params.id),
      body,
    );
    return toServiceResponse(res, { message: 'Magang berhasil diperpanjang' });
  }

  /**
   * PATCH /internships/:id/assign-supervisor
   * Menugaskan supervisor ke magang (HR_ADMIN).
   */
  public async AssignSupervisor(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<AssignSupervisorBody, 'supervisorId'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.ASSIGN_SUPERVISOR(params.id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Supervisor berhasil ditugaskan',
    });
  }

  /**
   * PATCH /internships/:id/change-department
   * Memindahkan departemen magang (HR_ADMIN).
   */
  public async ChangeDepartment(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<ChangeDepartmentBody, 'departmentId' | 'officeLocationId'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.CHANGE_DEPARTMENT(params.id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Departemen berhasil dipindahkan',
    });
  }

  /**
   * PATCH /internships/:id/archive
   * Mengarsipkan magang (HR_ADMIN).
   */
  public async Archive(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.ARCHIVE(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil diarsipkan' });
  }
}

export default new InternshipService();

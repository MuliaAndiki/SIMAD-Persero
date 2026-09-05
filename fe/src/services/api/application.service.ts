import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { APPLICATION_ENDPOINTS } from '@/configs/endpoints/application.endpoints';
import type {
  ApplicationParams,
  ApplicationQuery,
  ApplicationResponse,
  ApproveApplicationBody,
  ApproveApplicationResponse,
  CreateApplicationBody,
  RejectApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Application — 10 method, satu method per endpoint backend
 * (be/src/routes/applicationRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class ApplicationService {
  /**
   * POST /applications
   * Membuat lamaran magang baru (INTERN).
   */
  public async Create(
    body: Pick<
      CreateApplicationBody,
      'requestedStartDate' | 'requestedEndDate' | 'motivation' | 'coverLetterFileId'
    >,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.PostResponse<ApplicationResponse>(APPLICATION_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Lamaran berhasil dibuat',
      statusCode: 201,
    });
  }

  /**
   * GET /applications/me
   * Mengambil daftar lamaran milik sendiri (INTERN).
   */
  public async MyApplications(): Promise<TResponse<ApplicationResponse[]>> {
    const res = await client.GetResponse<ApplicationResponse[]>(APPLICATION_ENDPOINTS.MY);
    return toServiceResponse(res, {
      message: 'Daftar lamaran berhasil dimuat',
    });
  }

  /**
   * PATCH /applications/:id
   * Memperbarui draft lamaran (INTERN).
   */
  public async UpdateDraft(
    params: Pick<ApplicationParams, 'id'>,
    body: UpdateApplicationBody,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.PatchResponse<ApplicationResponse>(
      APPLICATION_ENDPOINTS.UPDATE(params.id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Draft lamaran berhasil diperbarui',
    });
  }

  /**
   * POST /applications/:id/submit
   * Mengirimkan lamaran (INTERN).
   */
  public async Submit(
    params: Pick<ApplicationParams, 'id'>,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.PostResponse<ApplicationResponse>(
      APPLICATION_ENDPOINTS.SUBMIT(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Lamaran berhasil dikirim', });
  }

  /**
   * POST /applications/:id/cancel
   * Membatalkan lamaran (INTERN).
   */
  public async Cancel(
    params: Pick<ApplicationParams, 'id'>,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.PostResponse<ApplicationResponse>(
      APPLICATION_ENDPOINTS.CANCEL(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Lamaran berhasil dibatalkan' });
  }

  /**
   * DELETE /applications/:id
   * Menghapus draft lamaran (INTERN).
   */
  public async DeleteDraft(params: Pick<ApplicationParams, 'id'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(APPLICATION_ENDPOINTS.DELETE(params.id));
    return toServiceResponse(res, {
      message: 'Draft lamaran berhasil dihapus',
    });
  }

  /**
   * GET /applications
   * Mengambil daftar seluruh lamaran dengan pagination dan filter (HR_ADMIN).
   */
  public async List(query?: ApplicationQuery): Promise<TResponse<ApplicationResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<ApplicationResponse[]>(
      `${APPLICATION_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar lamaran berhasil dimuat',
    });
  }

  /**
   * GET /applications/:id
   * Mengambil detail lamaran (HR_ADMIN, SUPERVISOR).
   */
  public async Detail(
    params: Pick<ApplicationParams, 'id'>,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.GetResponse<ApplicationResponse>(
      APPLICATION_ENDPOINTS.DETAIL(params.id),
    );
    return toServiceResponse(res, {
      message: 'Detail lamaran berhasil dimuat',
    });
  }

  /**
   * PATCH /applications/:id/approve
   * Menyetujui lamaran (HR_ADMIN).
   */
  public async Approve(
    params: Pick<ApplicationParams, 'id'>,
    body: Pick<
      ApproveApplicationBody,
      'departmentId' | 'officeLocationId' | 'supervisorId' | 'notes'
    >,
  ): Promise<TResponse<ApproveApplicationResponse>> {
    const res = await client.PatchResponse<ApproveApplicationResponse>(
      APPLICATION_ENDPOINTS.APPROVE(params.id),
      body,
    );
    return toServiceResponse(res, { message: 'Lamaran berhasil disetujui' });
  }

  /**
   * PATCH /applications/:id/reject
   * Menolak lamaran (HR_ADMIN).
   */
  public async Reject(
    params: Pick<ApplicationParams, 'id'>,
    body: Pick<RejectApplicationBody, 'reason'>,
  ): Promise<TResponse<ApplicationResponse>> {
    const res = await client.PatchResponse<ApplicationResponse>(
      APPLICATION_ENDPOINTS.REJECT(params.id),
      body,
    );
    return toServiceResponse(res, { message: 'Lamaran berhasil ditolak' });
  }
}

export default new ApplicationService();

import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { CORRECTION_ENDPOINTS } from '@/configs/endpoints/correction.endpoints';
import type {
  ApproveCorrectionBody,
  AttendanceCorrectionItem,
  CorrectionQuery,
  CreateCorrectionBody,
  RejectCorrectionBody,
} from '@/types/api/correction.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class CorrectionService {
  /**
   * POST /attendance/corrections (Intern submits)
   */
  public async Submit(body: CreateCorrectionBody): Promise<TResponse<AttendanceCorrectionItem>> {
    const res = await client.PostResponse<AttendanceCorrectionItem>(
      CORRECTION_ENDPOINTS.SUBMIT,
      body,
    );
    return toServiceResponse(res, {
      message: 'Pengajuan koreksi absensi berhasil dikirim',
      statusCode: 201,
    });
  }

  /**
   * GET /attendance/corrections/me (Intern my list)
   */
  public async MyList(query?: CorrectionQuery): Promise<TResponse<AttendanceCorrectionItem[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceCorrectionItem[]>(
      `${CORRECTION_ENDPOINTS.MY_LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Riwayat pengajuan koreksi berhasil dimuat',
    });
  }

  /**
   * GET /attendance/corrections/:id
   */
  public async Detail(id: string): Promise<TResponse<AttendanceCorrectionItem>> {
    const res = await client.GetResponse<AttendanceCorrectionItem>(
      CORRECTION_ENDPOINTS.DETAIL(id),
    );
    return toServiceResponse(res, {
      message: 'Detail pengajuan koreksi berhasil dimuat',
    });
  }

  /**
   * POST /attendance/corrections/:id/cancel
   */
  public async Cancel(id: string): Promise<TResponse<AttendanceCorrectionItem>> {
    const res = await client.PostResponse<AttendanceCorrectionItem>(
      CORRECTION_ENDPOINTS.CANCEL(id),
      {},
    );
    return toServiceResponse(res, {
      message: 'Pengajuan koreksi berhasil dibatalkan',
    });
  }

  /**
   * GET /supervisor/attendance-corrections
   */
  public async SupervisorList(
    query?: CorrectionQuery,
  ): Promise<TResponse<AttendanceCorrectionItem[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceCorrectionItem[]>(
      `${CORRECTION_ENDPOINTS.SUPERVISOR_LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar pengajuan koreksi absensi berhasil dimuat',
    });
  }

  /**
   * PATCH /supervisor/attendance-corrections/:id/approve
   */
  public async Approve(
    id: string,
    body: ApproveCorrectionBody,
  ): Promise<TResponse<{ correction: AttendanceCorrectionItem; attendance: any }>> {
    const res = await client.PatchResponse<{
      correction: AttendanceCorrectionItem;
      attendance: any;
    }>(CORRECTION_ENDPOINTS.SUPERVISOR_APPROVE(id), body);
    return toServiceResponse(res, {
      message: 'Pengajuan koreksi absensi berhasil disetujui',
    });
  }

  /**
   * PATCH /supervisor/attendance-corrections/:id/reject
   */
  public async Reject(
    id: string,
    body: RejectCorrectionBody,
  ): Promise<TResponse<AttendanceCorrectionItem>> {
    const res = await client.PatchResponse<AttendanceCorrectionItem>(
      CORRECTION_ENDPOINTS.SUPERVISOR_REJECT(id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Pengajuan koreksi absensi berhasil ditolak',
    });
  }
}

export default new CorrectionService();

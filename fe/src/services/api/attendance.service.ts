import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { ATTENDANCE_ENDPOINTS } from '@/configs/endpoints/attendance.endpoints';
import type {
  AttendanceDetailResponse,
  AttendanceExportQuery,
  AttendanceExportRow,
  AttendanceHistoryQuery,
  AttendanceParams,
  AttendanceQuery,
  AttendanceResponse,
  AttendanceSummaryResponse,
  AttendanceSupervisorRow,
  CheckInBody,
  CheckOutBody,
  OverrideAttendanceBody,
  OverrideAttendanceResponse,
} from '@/types/api/attendance.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Attendance — 10 method, satu method per endpoint backend
 * (be/src/routes/attendanceRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class AttendanceService {
  /**
   * POST /attendance/check-in
   * Check-in kehadiran (INTERN).
   */
  public async CheckIn(
    body: Pick<CheckInBody, 'latitude' | 'longitude' | 'accuracy' | 'deviceId' | 'fakeGpsDetected'>,
  ): Promise<TResponse<AttendanceResponse>> {
    const res = await client.PostResponse<AttendanceResponse>(ATTENDANCE_ENDPOINTS.CHECK_IN, body);
    return toServiceResponse(res, {
      message: 'Check-in berhasil',
      statusCode: 201,
    });
  }

  /**
   * POST /attendance/check-out
   * Check-out kehadiran (INTERN).
   */
  public async CheckOut(
    body: Pick<CheckOutBody, 'latitude' | 'longitude' | 'accuracy'>,
  ): Promise<TResponse<AttendanceResponse>> {
    const res = await client.PostResponse<AttendanceResponse>(ATTENDANCE_ENDPOINTS.CHECK_OUT, body);
    return toServiceResponse(res, { message: 'Check-out berhasil' });
  }

  /**
   * GET /attendance/me
   * Mengambil riwayat kehadiran sendiri (INTERN).
   */
  public async My(query?: AttendanceQuery): Promise<TResponse<AttendanceResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceResponse[]>(`${ATTENDANCE_ENDPOINTS.MY}${qs}`);
    return toServiceResponse(res, {
      message: 'Riwayat kehadiran berhasil dimuat',
    });
  }

  /**
   * GET /attendance/today
   * Mengambil data kehadiran hari ini (INTERN).
   */
  public async Today(): Promise<TResponse<AttendanceResponse>> {
    const res = await client.GetResponse<AttendanceResponse>(ATTENDANCE_ENDPOINTS.TODAY);
    return toServiceResponse(res, {
      message: 'Kehadiran hari ini berhasil dimuat',
    });
  }

  /**
   * GET /attendance/summary
   * Mengambil ringkasan kehadiran bulanan (INTERN).
   */
  public async Summary(query?: AttendanceQuery): Promise<TResponse<AttendanceSummaryResponse>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceSummaryResponse>(
      `${ATTENDANCE_ENDPOINTS.SUMMARY}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Ringkasan kehadiran berhasil dimuat',
    });
  }

  /**
   * GET /attendance/supervisor
   * Mengambil dashboard kehadiran supervisor (SUPERVISOR).
   */
  public async Supervisor(): Promise<TResponse<AttendanceSupervisorRow[]>> {
    const res = await client.GetResponse<AttendanceSupervisorRow[]>(
      ATTENDANCE_ENDPOINTS.SUPERVISOR,
    );
    return toServiceResponse(res, {
      message: 'Dashboard supervisor berhasil dimuat',
    });
  }

  /**
   * GET /attendance/history
   * Mengambil riwayat kehadiran semua peserta (HR_ADMIN).
   */
  public async History(query?: AttendanceHistoryQuery): Promise<TResponse<AttendanceResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceResponse[]>(
      `${ATTENDANCE_ENDPOINTS.HISTORY}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Riwayat kehadiran berhasil dimuat',
    });
  }

  /**
   * GET /attendance/export
   * Mengekspor data kehadiran (HR_ADMIN, SUPERVISOR, INTERN).
   */
  public async Export(query?: AttendanceExportQuery): Promise<TResponse<AttendanceExportRow[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceExportRow[]>(
      `${ATTENDANCE_ENDPOINTS.EXPORT}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Data kehadiran berhasil diekspor',
    });
  }

  /**
   * GET /attendance/export (Blob/Buffer)
   * Mengekspor data kehadiran dan mengunduhnya sebagai Excel.
   */
  public async DownloadExcel(query?: AttendanceExportQuery): Promise<void> {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const endpoint = `${url.origin}${url.pathname}${ATTENDANCE_ENDPOINTS.EXPORT}${qs}`;

    const { getAccessToken } = await import('@/utils/session-cookie');
    const token = getAccessToken();

    const response = await fetch(endpoint, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh data absensi');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const filenameMatch = response.headers.get('Content-Disposition')?.match(/filename=(.+)/);
    const filename = filenameMatch
      ? filenameMatch[1]
      : `attendance_export_${new Date().getTime()}.xlsx`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * GET /attendance/:attendanceId
   * Mengambil detail kehadiran (HR_ADMIN, SUPERVISOR).
   */
  public async Detail(
    params: Pick<AttendanceParams, 'attendanceId'>,
  ): Promise<TResponse<AttendanceDetailResponse>> {
    const res = await client.GetResponse<AttendanceDetailResponse>(
      ATTENDANCE_ENDPOINTS.DETAIL(params.attendanceId),
    );
    return toServiceResponse(res, {
      message: 'Detail kehadiran berhasil dimuat',
    });
  }

  /**
   * PATCH /attendance/:attendanceId/override
   * Override status kehadiran (SUPERVISOR).
   */
  public async Override(
    params: Pick<AttendanceParams, 'attendanceId'>,
    body: Pick<OverrideAttendanceBody, 'status' | 'reason'>,
  ): Promise<TResponse<OverrideAttendanceResponse>> {
    const res = await client.PatchResponse<OverrideAttendanceResponse>(
      ATTENDANCE_ENDPOINTS.OVERRIDE(params.attendanceId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Status kehadiran berhasil di-override',
    });
  }
}

export default new AttendanceService();

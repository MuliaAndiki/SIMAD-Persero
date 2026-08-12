import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { REPORTING_ENDPOINTS } from '@/configs/endpoints/reporting.endpoints';
import type {
  AttendanceReportRow,
  CertificateReportRow,
  DashboardReportData,
  InternshipReportRow,
  ReportingQuery,
} from '@/types/api/reporting.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Reporting — 4 method, satu method per endpoint backend
 * (be/src/routes/reportingRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class ReportingService {
  /**
   * GET /reports/attendance
   * Mengambil laporan kehadiran (HR_ADMIN).
   */
  public async Attendance(query?: ReportingQuery): Promise<TResponse<AttendanceReportRow[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<AttendanceReportRow[]>(
      `${REPORTING_ENDPOINTS.ATTENDANCE}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Laporan kehadiran berhasil dimuat',
    });
  }

  /**
   * GET /reports/internships
   * Mengambil laporan peserta magang (HR_ADMIN).
   */
  public async Internships(): Promise<TResponse<InternshipReportRow[]>> {
    const res = await client.GetResponse<InternshipReportRow[]>(REPORTING_ENDPOINTS.INTERNSHIPS);
    return toServiceResponse(res, {
      message: 'Laporan magang berhasil dimuat',
    });
  }

  /**
   * GET /reports/certificates
   * Mengambil laporan sertifikat (HR_ADMIN).
   */
  public async Certificates(): Promise<TResponse<CertificateReportRow[]>> {
    const res = await client.GetResponse<CertificateReportRow[]>(REPORTING_ENDPOINTS.CERTIFICATES);
    return toServiceResponse(res, {
      message: 'Laporan sertifikat berhasil dimuat',
    });
  }

  /**
   * GET /reports/dashboard
   * Mengambil laporan ringkasan dashboard (HR_ADMIN).
   */
  public async Dashboard(): Promise<TResponse<DashboardReportData>> {
    const res = await client.GetResponse<DashboardReportData>(REPORTING_ENDPOINTS.DASHBOARD);
    return toServiceResponse(res, {
      message: 'Laporan dashboard berhasil dimuat',
    });
  }
}

export default new ReportingService();

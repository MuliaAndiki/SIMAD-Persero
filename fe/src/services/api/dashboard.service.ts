import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { DASHBOARD_ENDPOINTS } from '@/configs/endpoints/dashboard.endpoints';
import type {
  ChartsResponse,
  DashboardStatistics,
  HrDashboardResponse,
  InternDashboardResponse,
  RecentActivityQuery,
  RecentActivityResponse,
  ReceptionistDashboardData,
  SupervisorDashboardData,
} from '@/types/api/dashboard.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Dashboard — 6 method, satu method per endpoint backend
 * (be/src/routes/dashboardRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class DashboardService {
  /**
   * GET /intern/dashboard
   * Mengambil dashboard intern (INTERN).
   */
  public async Intern(): Promise<TResponse<InternDashboardResponse>> {
    const res = await client.GetResponse<InternDashboardResponse>(DASHBOARD_ENDPOINTS.INTERN);
    return toServiceResponse(res, {
      message: 'Dashboard intern berhasil dimuat',
    });
  }

  /**
   * GET /hr-admin/dashboard
   * Mengambil dashboard HR (HR_ADMIN).
   */
  public async Hr(): Promise<TResponse<HrDashboardResponse>> {
    const res = await client.GetResponse<HrDashboardResponse>(DASHBOARD_ENDPOINTS.HR);
    return toServiceResponse(res, { message: 'Dashboard HR berhasil dimuat' });
  }

  /**
   * GET /supervisor/dashboard
   * Mengambil dashboard supervisor (SUPERVISOR).
   */
  public async Supervisor(): Promise<TResponse<SupervisorDashboardData>> {
    const res = await client.GetResponse<SupervisorDashboardData>(DASHBOARD_ENDPOINTS.SUPERVISOR);
    return toServiceResponse(res, {
      message: 'Dashboard supervisor berhasil dimuat',
    });
  }

  /**
   * GET /receptionist/dashboard
   * Mengambil dashboard receptionist (RECEPTIONIST).
   */
  public async Receptionist(): Promise<TResponse<ReceptionistDashboardData>> {
    const res = await client.GetResponse<ReceptionistDashboardData>(
      DASHBOARD_ENDPOINTS.RECEPTIONIST,
    );
    return toServiceResponse(res, {
      message: 'Dashboard receptionist berhasil dimuat',
    });
  }

  /**
   * GET /hr-admin/dashboard/statistics
   * Mengambil statistik dashboard (HR_ADMIN).
   */
  public async Statistics(): Promise<TResponse<DashboardStatistics>> {
    const res = await client.GetResponse<DashboardStatistics>(DASHBOARD_ENDPOINTS.STATISTICS);
    return toServiceResponse(res, { message: 'Statistik berhasil dimuat' });
  }

  /**
   * GET /hr-admin/dashboard/charts
   * Mengambil data chart dashboard (HR_ADMIN).
   */
  public async Charts(): Promise<TResponse<ChartsResponse>> {
    const res = await client.GetResponse<ChartsResponse>(DASHBOARD_ENDPOINTS.CHARTS);
    return toServiceResponse(res, { message: 'Data chart berhasil dimuat' });
  }

  /**
   * GET /hr-admin/dashboard/recent-activities
   * Mengambil aktivitas terbaru (HR_ADMIN).
   */
  public async RecentActivities(
    query?: RecentActivityQuery,
  ): Promise<TResponse<RecentActivityResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<RecentActivityResponse[]>(
      `${DASHBOARD_ENDPOINTS.RECENT_ACTIVITIES}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Aktivitas terbaru berhasil dimuat',
    });
  }
}

export default new DashboardService();

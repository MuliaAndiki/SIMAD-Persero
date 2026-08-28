import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import dashboardService from '@/services/dashboard.service';
import type { RecentActivityQuery } from '@/types/dashboard.types';

/**
 * Thin controller modul Dashboard.
 * Seluruh logika bisnis didelegasikan ke DashboardService.
 * Sumber aturan: docs/07-api-specification.md §19.
 */
class DashboardController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /dashboard/intern
  public async internDashboard(c: AppContext) {
    try {
      const data = await dashboardService.getInternDashboard(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /dashboard/hr
  public async hrDashboard(c: AppContext) {
    try {
      const data = await dashboardService.getHrDashboard();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /dashboard/supervisor
  public async supervisorDashboard(c: AppContext) {
    try {
      const data = await dashboardService.getSupervisorDashboard(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /receptionist/dashboard
  public async receptionistDashboard(c: AppContext) {
    try {
      const data = await dashboardService.getReceptionistDashboard();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /dashboard/statistics
  public async statistics(c: AppContext) {
    try {
      const data = await dashboardService.getStatistics();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /dashboard/charts
  public async charts(c: AppContext) {
    try {
      const data = await dashboardService.getCharts();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /dashboard/recent-activities
  public async recentActivities(c: AppContext) {
    try {
      const query = (c.query ?? {}) as unknown as RecentActivityQuery;
      const result = await dashboardService.getRecentActivities(query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new DashboardController();

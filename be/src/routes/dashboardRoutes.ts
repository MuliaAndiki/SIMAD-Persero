import type { AppContext } from '@/contex';
import dashboardController from '@/controllers/DashboardController';
import { RecentActivityQuery } from '@/dtos/dashboard.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Dashboard.
 * Base URL: /dashboard
 * Source: docs/07-api-specification.md §19
 */
class DashboardRouter {
  public dashboardRouter;

  constructor() {
    this.dashboardRouter = new Elysia({ prefix: '/dashboard' });
    this.routes();
  }

  private routes() {
    // 19.1 GET /dashboard/intern (INTERN)
    this.dashboardRouter.get('/intern', (c: AppContext) => dashboardController.internDashboard(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
    });

    // 19.2 GET /dashboard/hr (HR_ADMIN)
    this.dashboardRouter.get('/hr', (c: AppContext) => dashboardController.hrDashboard(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
    });

    // 19.3 GET /dashboard/supervisor (SUPERVISOR)
    this.dashboardRouter.get(
      '/supervisor',
      (c: AppContext) => dashboardController.supervisorDashboard(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['SUPERVISOR']).beforeHandle],
      },
    );

    // 19.4 GET /dashboard/statistics (HR_ADMIN)
    this.dashboardRouter.get('/statistics', (c: AppContext) => dashboardController.statistics(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
    });

    // 19.5 GET /dashboard/charts (HR_ADMIN)
    this.dashboardRouter.get('/charts', (c: AppContext) => dashboardController.charts(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
    });

    // 19.6 GET /dashboard/recent-activities (semua role)
    this.dashboardRouter.get(
      '/recent-activities',
      (c: AppContext) => dashboardController.recentActivities(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR', 'RECEPTIONIST']).beforeHandle,
        ],
        query: RecentActivityQuery,
      },
    );
  }
}

export default new DashboardRouter().dashboardRouter;

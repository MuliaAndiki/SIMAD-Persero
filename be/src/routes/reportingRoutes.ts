import type { AppContext } from '@/contex';
import reportingController from '@/controllers/ReportingController';
import { ReportingQuery } from '@/dtos/reporting.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Reporting.
 * Base URL: /reports
 * Source: docs/07-api-specification.md §26
 */
class ReportingRouter {
  public reportingRouter;

  constructor() {
    this.reportingRouter = new Elysia({ prefix: '/reports' });
    this.routes();
  }

  private routes() {
    // 26.1 GET /reports/attendance (HR_ADMIN)
    this.reportingRouter.get(
      '/attendance',
      (c: AppContext) => reportingController.attendanceReport(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        query: ReportingQuery,
      },
    );

    // 26.2 GET /reports/internships (HR_ADMIN)
    this.reportingRouter.get(
      '/internships',
      (c: AppContext) => reportingController.internshipReport(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      },
    );

    // 26.3 GET /reports/certificates (HR_ADMIN)
    this.reportingRouter.get(
      '/certificates',
      (c: AppContext) => reportingController.certificateReport(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      },
    );

    // 26.4 GET /reports/dashboard (HR_ADMIN)
    this.reportingRouter.get(
      '/dashboard',
      (c: AppContext) => reportingController.dashboardReport(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      },
    );
  }
}

export default new ReportingRouter().reportingRouter;

import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import reportingService from '@/services/reporting.service';
import type { ReportingQuery } from '@/types/reporting.types';

/**
 * Thin controller modul Reporting.
 * Seluruh logika bisnis didelegasikan ke ReportingService.
 * Sumber aturan: docs/07-api-specification.md §26.
 */
class ReportingController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /reports/attendance
  public async attendanceReport(c: AppContext) {
    try {
      const query = (c.query ?? {}) as unknown as ReportingQuery;
      const data = await reportingService.getAttendanceReport(query);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /reports/internships
  public async internshipReport(c: AppContext) {
    try {
      const data = await reportingService.getInternshipReport();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /reports/certificates
  public async certificateReport(c: AppContext) {
    try {
      const data = await reportingService.getCertificateReport();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /reports/dashboard
  public async dashboardReport(c: AppContext) {
    try {
      const data = await reportingService.getDashboardReport();
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new ReportingController();

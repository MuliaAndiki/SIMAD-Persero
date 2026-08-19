import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import attendanceService from '@/services/attendance.service';
import type {
  AttendanceExportQuery,
  AttendanceHistoryQuery,
  AttendanceQuery,
  CheckInBody,
  CheckOutBody,
  OverrideAttendanceBody,
} from '@/types/attendance.types';

/**
 * Thin controller for the Attendance module.
 * Delegates all business logic to AttendanceService.
 * Source: docs/07-api-specification.md §16
 */
class AttendanceController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  private getMeta(c: AppContext): { ipAddress?: string; userAgent?: string } {
    const ipAddress =
      (c.request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
    const userAgent = c.request.headers.get('user-agent') ?? undefined;
    return { ipAddress, userAgent };
  }

  // POST /attendance/check-in
  public async checkIn(c: AppContext) {
    try {
      const body = c.body as unknown as CheckInBody;
      const data = await attendanceService.checkIn(c.user!.id, body, this.getMeta(c));
      return HttpResponse(c).ok(data, undefined, 'Check In berhasil.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /attendance/check-out
  public async checkOut(c: AppContext) {
    try {
      const body = c.body as unknown as CheckOutBody;
      const data = await attendanceService.checkOut(c.user!.id, body, this.getMeta(c));
      return HttpResponse(c).ok(data, undefined, 'Check Out berhasil.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/me
  public async getMyAttendance(c: AppContext) {
    try {
      const query = c.query as unknown as AttendanceQuery;
      const { data, meta } = await attendanceService.getMyAttendance(c.user!.id, query);
      return HttpResponse(c).ok(data, meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/:id
  public async getById(c: AppContext) {
    try {
      // INTERN hanya boleh melihat detail absensinya sendiri (ownership check).
      const userId = c.user!.roles?.includes('INTERN') ? c.user!.id : undefined;
      const data = await attendanceService.getById(c.params.attendanceId, userId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/today
  public async getToday(c: AppContext) {
    try {
      const data = await attendanceService.getToday(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/summary
  public async getSummary(c: AppContext) {
    try {
      const query = c.query as unknown as AttendanceQuery;
      const data = await attendanceService.getSummary(c.user!.id, query);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/supervisor
  public async getSupervisorDashboard(c: AppContext) {
    try {
      const data = await attendanceService.getSupervisorDashboard(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /attendance/:id/override
  public async override(c: AppContext) {
    try {
      const body = c.body as unknown as OverrideAttendanceBody;
      const data = await attendanceService.override(c.params.attendanceId, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Override berhasil.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/history
  public async getHistory(c: AppContext) {
    try {
      const query = c.query as unknown as AttendanceHistoryQuery;
      const { data, meta } = await attendanceService.getHistory(query);
      return HttpResponse(c).ok(data, meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/export
  public async exportAttendance(c: AppContext) {
    try {
      const query = c.query as unknown as AttendanceExportQuery;
      const buffer = await attendanceService.exportAttendance(c.user!, query);

      c.set.headers['Content-Type'] =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      c.set.headers['Content-Disposition'] =
        `attachment; filename=attendance_export_${Date.now()}.xlsx`;

      return buffer;
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new AttendanceController();

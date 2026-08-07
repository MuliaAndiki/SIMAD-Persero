import type { AppContext } from '@/contex';
import attendanceController from '@/controllers/AttendanceController';
import {
  AttendanceExportQuery,
  AttendanceHistoryQuery,
  AttendanceIdParam,
  AttendanceListQuery,
  CheckInDto,
  CheckOutDto,
  OverrideAttendanceDto,
} from '@/dtos/attendance.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import { idempotency } from '@/middlewares/idempotency';
import { keyByUser, rateLimit, RateLimitRule } from '@/middlewares/rateLimit';
import Elysia from 'elysia';

const idempotencyMiddleware = idempotency();

/**
 * Routes for the Attendance module.
 * Base URL: /attendance
 * Source: docs/07-api-specification.md §16
 */
class AttendanceRouter {
  public attendanceRouter;

  constructor() {
    this.attendanceRouter = new Elysia({ prefix: '/attendance' });
    this.routes();
  }

  private routes() {
    // ─── Intern Routes ─────────────────────────────────────────

    // 16.1 POST /attendance/check-in (INTERN)
    this.attendanceRouter.post('/check-in', (c: AppContext) => attendanceController.checkIn(c), {
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['INTERN']).beforeHandle,
        rateLimit({ ...RateLimitRule.ATTENDANCE, keyGenerator: keyByUser }).beforeHandle,
        idempotencyMiddleware.beforeHandle,
      ],
      afterHandle: [idempotencyMiddleware.afterHandle],
      body: CheckInDto,
    });

    // 16.2 POST /attendance/check-out (INTERN)
    this.attendanceRouter.post('/check-out', (c: AppContext) => attendanceController.checkOut(c), {
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['INTERN']).beforeHandle,
        rateLimit({ ...RateLimitRule.ATTENDANCE, keyGenerator: keyByUser }).beforeHandle,
        idempotencyMiddleware.beforeHandle,
      ],
      afterHandle: [idempotencyMiddleware.afterHandle],
      body: CheckOutDto,
    });

    // 16.3 GET /attendance/me (INTERN)
    this.attendanceRouter.get('/me', (c: AppContext) => attendanceController.getMyAttendance(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      query: AttendanceListQuery,
    });

    // 16.5 GET /attendance/today (INTERN)
    this.attendanceRouter.get('/today', (c: AppContext) => attendanceController.getToday(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
    });

    // 16.6 GET /attendance/summary (INTERN)
    this.attendanceRouter.get('/summary', (c: AppContext) => attendanceController.getSummary(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      query: AttendanceListQuery,
    });

    // ─── Supervisor Routes ─────────────────────────────────────

    // 16.7 GET /attendance/supervisor (SUPERVISOR)
    this.attendanceRouter.get(
      '/supervisor',
      (c: AppContext) => attendanceController.getSupervisorDashboard(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['SUPERVISOR']).beforeHandle],
      },
    );

    // ─── HR Admin Routes ───────────────────────────────────────

    // 16.9 GET /attendance/history (HR_ADMIN)
    this.attendanceRouter.get('/history', (c: AppContext) => attendanceController.getHistory(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      query: AttendanceHistoryQuery,
    });

    // 16.10 GET /attendance/export (HR_ADMIN)
    this.attendanceRouter.get(
      '/export',
      (c: AppContext) => attendanceController.exportAttendance(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
        query: AttendanceExportQuery,
      },
    );

    // ─── Detail Routes (must be after static routes) ───────────

    // 16.4 GET /attendance/:id (HR_ADMIN, SUPERVISOR)
    this.attendanceRouter.get(
      '/:attendanceId',
      (c: AppContext) => attendanceController.getById(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['HR_ADMIN', 'SUPERVISOR']).beforeHandle,
        ],
        params: AttendanceIdParam,
      },
    );

    // 16.8 PATCH /attendance/:id/override (SUPERVISOR)
    this.attendanceRouter.patch(
      '/:attendanceId/override',
      (c: AppContext) => attendanceController.override(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['SUPERVISOR']).beforeHandle],
        params: AttendanceIdParam,
        body: OverrideAttendanceDto,
      },
    );
  }
}

export default new AttendanceRouter().attendanceRouter;

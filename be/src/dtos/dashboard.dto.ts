import { Type } from '@sinclair/typebox';

// ── Query ──────────────────────────────────────────────────────────────

/** GET /dashboard/recent-activities query. */
export const RecentActivityQuery = Type.Object({
  page: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
});

/** GET /supervisor/dashboard/attendance-trend query. */
export const SupervisorAttendanceTrendQuery = Type.Object({
  days: Type.Optional(Type.Number({ minimum: 1, maximum: 90, default: 7 })),
});

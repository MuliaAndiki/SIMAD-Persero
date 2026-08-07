import { Type } from '@sinclair/typebox';

// ── Query ──────────────────────────────────────────────────────────────

/** GET /reports/attendance query (BR-REPORT-003 / BR-REPORT-004). */
export const ReportingQuery = Type.Object({
  departmentId: Type.Optional(Type.String()),
  month: Type.Optional(Type.Number()),
  year: Type.Optional(Type.Number()),
  format: Type.Optional(Type.String()),
});

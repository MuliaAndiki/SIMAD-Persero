import { Type } from '@sinclair/typebox';

// ── Query ──────────────────────────────────────────────────────────────

export const ReportingQuery = Type.Object({
  officeLocationId: Type.Optional(Type.String()),
  departmentId: Type.Optional(Type.String()),
  internshipId: Type.Optional(Type.String()),
  month: Type.Optional(Type.Number()),
  year: Type.Optional(Type.Number()),
  format: Type.Optional(Type.String()),
});

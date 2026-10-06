import { t } from 'elysia';

// ── Query ──────────────────────────────────────────────────────────────

export const ReportingQuery = t.Object({
  officeLocationId: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  internshipId: t.Optional(t.String()),
  month: t.Optional(t.Numeric({ minimum: 1, maximum: 12 })),
  year: t.Optional(t.Numeric()),
  format: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
});

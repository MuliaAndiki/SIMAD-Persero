import { Type } from '@sinclair/typebox';

// ── Query ──────────────────────────────────────────────────────────────

/** GET /dashboard/recent-activities query. */
export const RecentActivityQuery = Type.Object({
  page: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
});

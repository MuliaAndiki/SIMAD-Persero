import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const AuditLogIdParam = Type.Object({
  auditId: Type.String({ format: 'uuid' }),
});

export const AuditLogUserIdParam = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

// ── Query ──────────────────────────────────────────────────────────────

/** GET /audit-logs query. */
export const AuditLogQuery = Type.Object({
  page: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
  module: Type.Optional(Type.String()),
  action: Type.Optional(Type.String()),
  userId: Type.Optional(Type.String()),
  startDate: Type.Optional(Type.String()),
  endDate: Type.Optional(Type.String()),
});

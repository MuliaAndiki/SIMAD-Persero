import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const SupervisorIdParam = Type.Object({
  supervisorId: Type.String({ format: 'uuid' }),
});

export const SupervisorAssignmentParam = Type.Object({
  supervisorId: Type.String({ format: 'uuid' }),
  assignmentId: Type.String({ format: 'uuid' }),
});

// ── List query ─────────────────────────────────────────────────────────

export const SupervisorListQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
});

// ── Assign body (HR_ADMIN) ─────────────────────────────────────────────

export const AssignInternDto = Type.Object({
  internshipId: Type.String({ format: 'uuid' }),
});

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

// ── Create & Update body ─────────────────────────────────────────────

export const CreateSupervisorDto = Type.Object({
  fullName: Type.String({ minLength: 1, maxLength: 150 }),
  email: Type.String({ format: 'email', maxLength: 150 }),
  departmentId: Type.String({ format: 'uuid' }),
  password: Type.String({ minLength: 8 }),
});

export const UpdateSupervisorDto = Type.Object({
  fullName: Type.Optional(Type.String({ minLength: 1, maxLength: 150 })),
  email: Type.Optional(Type.String({ format: 'email', maxLength: 150 })),
  departmentId: Type.Optional(Type.String({ format: 'uuid' })),
  password: Type.Optional(Type.String({ minLength: 8 })),
  isActive: Type.Optional(Type.Boolean()),
});

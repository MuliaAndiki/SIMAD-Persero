import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const ReceptionistIdParam = Type.Object({
  receptionistId: Type.String({ format: 'uuid' }),
});

// ── List query ─────────────────────────────────────────────────────────

export const ReceptionistListQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  keyword: Type.Optional(Type.String()),
  officeId: Type.Optional(Type.String({ format: 'uuid' })),
});

// ── Create & Update body ─────────────────────────────────────────────

export const CreateReceptionistDto = Type.Object({
  fullName: Type.String({ minLength: 1, maxLength: 150 }),
  email: Type.String({ format: 'email', maxLength: 150 }),
  departmentId: Type.String({ format: 'uuid' }),
  officeId: Type.String({ format: 'uuid' }),
  password: Type.Optional(Type.String({ minLength: 6 })),
});

export const UpdateReceptionistDto = Type.Object({
  fullName: Type.Optional(Type.String({ minLength: 1, maxLength: 150 })),
  email: Type.Optional(Type.String({ format: 'email', maxLength: 150 })),
  departmentId: Type.Optional(Type.String({ format: 'uuid' })),
  officeId: Type.Optional(Type.String({ format: 'uuid' })),
  password: Type.Optional(Type.String({ minLength: 6 })),
  isActive: Type.Optional(Type.Boolean()),
});

import { t } from 'elysia';

// ─── Path Params ─────────────────────────────────────────────────
export const InternshipIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

// ─── Body Schemas ────────────────────────────────────────────────

/** PATCH /internships/:id/extend */
export const ExtendInternshipDto = t.Object({
  newEndDate: t.String({ format: 'date' }),
  reason: t.Optional(t.String()),
});

/** PATCH /internships/:id/assign-supervisor */
export const AssignSupervisorDto = t.Object({
  supervisorId: t.String({ format: 'uuid' }),
});

/** PATCH /internships/:id/change-department */
export const ChangeDepartmentDto = t.Object({
  departmentId: t.String({ format: 'uuid' }),
  officeLocationId: t.Optional(t.String({ format: 'uuid' })),
});

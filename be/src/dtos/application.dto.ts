import { t } from 'elysia';

// ─── Path Params ─────────────────────────────────────────────────
export const ApplicationIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

// ─── Body Schemas ────────────────────────────────────────────────

/** POST /applications */
export const CreateApplicationDto = t.Object({
  requestedStartDate: t.String({ format: 'date' }),
  requestedEndDate: t.String({ format: 'date' }),
  motivation: t.Optional(t.String()),
  coverLetterFileId: t.Optional(t.String({ format: 'uuid' })),
  cvFileId: t.Optional(t.String({ format: 'uuid' })),
  facultyLetterFileId: t.Optional(t.String({ format: 'uuid' })),
  officeLocationId: t.String({ format: 'uuid' }),
});

/** PATCH /applications/:id (draft edit) */
export const UpdateApplicationDto = t.Object({
  requestedStartDate: t.Optional(t.String({ format: 'date' })),
  requestedEndDate: t.Optional(t.String({ format: 'date' })),
  motivation: t.Optional(t.String()),
  coverLetterFileId: t.Optional(t.String({ format: 'uuid' })),
  cvFileId: t.Optional(t.String({ format: 'uuid' })),
  facultyLetterFileId: t.Optional(t.String({ format: 'uuid' })),
  officeLocationId: t.Optional(t.String({ format: 'uuid' })),
});

/** PATCH /applications/:id/approve */
export const ApproveApplicationDto = t.Object({
  departmentId: t.String({ format: 'uuid' }),
  officeLocationId: t.Optional(t.String({ format: 'uuid' })),
  supervisorId: t.String({ format: 'uuid' }),
  actualStartDate: t.Optional(t.String({ format: 'date' })),
  actualEndDate: t.Optional(t.String({ format: 'date' })),
  notes: t.Optional(t.String()),
});

/** PATCH /applications/:id/reject */
export const RejectApplicationDto = t.Object({
  reason: t.String({ minLength: 1 }),
});

// ─── Query Schema ────────────────────────────────────────────────

/** GET /applications (HR list) */
export const ApplicationListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
  keyword: t.Optional(t.String()),
  institution: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  officeLocationId: t.Optional(t.String()),
});

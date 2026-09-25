import { t } from 'elysia';

export const CorrectionIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

export const CreateCorrectionDto = t.Object({
  attendanceId: t.String({ format: 'uuid' }),
  correctionType: t.Union([
    t.Literal('CHECK_IN'),
    t.Literal('CHECK_OUT'),
    t.Literal('BOTH'),
    t.Literal('INVALID_OVERRIDE'),
  ]),
  requestedCheckIn: t.Optional(t.String()),
  requestedCheckOut: t.Optional(t.String()),
  reason: t.String({ minLength: 5 }),
  evidenceFileId: t.Optional(t.String({ format: 'uuid' })),
});

export const ApproveCorrectionDto = t.Object({
  supervisorNotes: t.Optional(t.String()),
});

export const RejectCorrectionDto = t.Object({
  supervisorNotes: t.String({ minLength: 3 }),
});

export const CorrectionListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
  internshipId: t.Optional(t.String()),
  supervisorId: t.Optional(t.String()),
  correctionType: t.Optional(t.String()),
});

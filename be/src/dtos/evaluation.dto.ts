import { t } from 'elysia';

export const InternshipIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

export const SaveEvaluationDto = t.Object({
  disciplineScore: t.Numeric({ minimum: 0, maximum: 100 }),
  responsibilityScore: t.Numeric({ minimum: 0, maximum: 100 }),
  teamworkScore: t.Numeric({ minimum: 0, maximum: 100 }),
  communicationScore: t.Numeric({ minimum: 0, maximum: 100 }),
  technicalScore: t.Numeric({ minimum: 0, maximum: 100 }),
  initiativeScore: t.Numeric({ minimum: 0, maximum: 100 }),
  comments: t.Optional(t.String()),
});

export const EvaluationListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
  supervisorId: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  officeLocationId: t.Optional(t.String()),
  keyword: t.Optional(t.String()),
});

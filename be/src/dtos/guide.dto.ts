import { t } from 'elysia';

export const GuideIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

export const GuideSlugParam = t.Object({
  slug: t.String({ minLength: 1 }),
});

export const CreateGuideDto = t.Object({
  title: t.String({ minLength: 3 }),
  slug: t.Optional(t.String()),
  description: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  content: t.String({ minLength: 5 }),
  category: t.String({ minLength: 2 }),
  displayOrder: t.Optional(t.Numeric()),
  isPublished: t.Optional(t.Boolean()),
});

export const UpdateGuideDto = t.Object({
  title: t.Optional(t.String({ minLength: 3 })),
  slug: t.Optional(t.String()),
  description: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  content: t.Optional(t.String({ minLength: 5 })),
  category: t.Optional(t.String({ minLength: 2 })),
  displayOrder: t.Optional(t.Numeric()),
  isPublished: t.Optional(t.Boolean()),
});

export const GuideListQuery = t.Object({
  category: t.Optional(t.String()),
  isPublished: t.Optional(t.String()),
  keyword: t.Optional(t.String()),
});

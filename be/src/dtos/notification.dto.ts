import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const NotificationIdParam = Type.Object({
  notificationId: Type.String({ format: 'uuid' }),
});

// ── List query ─────────────────────────────────────────────────────────

export const NotificationListQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
});

// ── Send body (HR_ADMIN) ───────────────────────────────────────────────

export const SendNotificationDto = Type.Object({
  typeCode: Type.Optional(Type.String()),
  title: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 }),
  isBroadcast: Type.Optional(Type.Boolean({ default: false })),
  userIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })),
});

import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const AttendanceIdParam = Type.Object({
  attendanceId: Type.String({ format: 'uuid' }),
});

// ── Check-in body ──────────────────────────────────────────────────────

export const CheckInDto = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
  accuracy: Type.Number({ minimum: 0 }),
  deviceId: Type.Optional(Type.String()),
  fakeGpsDetected: Type.Optional(Type.Boolean()),
});

// ── Check-out body ─────────────────────────────────────────────────────

export const CheckOutDto = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
  accuracy: Type.Number({ minimum: 0 }),
});

// ── Override body ──────────────────────────────────────────────────────

export const OverrideAttendanceDto = Type.Object({
  status: Type.String(),
  reason: Type.String({ minLength: 1 }),
});

// ── My attendance query ────────────────────────────────────────────────

export const AttendanceListQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  month: Type.Optional(Type.Number({ minimum: 1, maximum: 12 })),
  year: Type.Optional(Type.Number({ minimum: 2020 })),
});

// ── History query (admin/supervisor) ───────────────────────────────────

export const AttendanceHistoryQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  month: Type.Optional(Type.Number({ minimum: 1, maximum: 12 })),
  year: Type.Optional(Type.Number({ minimum: 2020 })),
  internshipId: Type.Optional(Type.String({ format: 'uuid' })),
  status: Type.Optional(Type.String()),
});

// ── Export query ────────────────────────────────────────────────────────

export const AttendanceExportQuery = Type.Object({
  departmentId: Type.Optional(Type.String({ format: 'uuid' })),
  month: Type.Optional(Type.Number({ minimum: 1, maximum: 12 })),
  year: Type.Optional(Type.Number({ minimum: 2020 })),
  format: Type.Optional(Type.String({ default: 'json' })),
});

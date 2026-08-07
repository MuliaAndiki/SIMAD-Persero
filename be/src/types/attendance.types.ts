/**
 * Attendance type definitions.
 * Diturunkan dari base model (models.types.ts) memakai Utility Types.
 * Source: docs/04-business-rules.md §14-21, docs/05-state-machine.md §13-20
 */
import type { IDepartment, IInternship } from './models.types';

// ── Check-in status (BR-ATT §19) ──────────────────────────────────────
export const CheckInStatus = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  PENDING_REVIEW: 'PENDING_REVIEW',
  INVALID: 'INVALID',
  ABSENT: 'ABSENT',
} as const;
export type CheckInStatus = (typeof CheckInStatus)[keyof typeof CheckInStatus];

// ── Check-out status ───────────────────────────────────────────────────
export const CheckOutStatus = {
  COMPLETED: 'COMPLETED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  INVALID: 'INVALID',
  ABSENT: 'ABSENT',
} as const;
export type CheckOutStatus = (typeof CheckOutStatus)[keyof typeof CheckOutStatus];

// ── Overall attendance status (§19) ────────────────────────────────────
export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  COMPLETED: 'COMPLETED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  INVALID: 'INVALID',
  ABSENT: 'ABSENT',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// ── Attendance log actions ─────────────────────────────────────────────
export const AttendanceLogAction = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
} as const;
export type AttendanceLogAction = (typeof AttendanceLogAction)[keyof typeof AttendanceLogAction];

// ── Violation types (§21) ──────────────────────────────────────────────
export const ViolationType = {
  FAKE_GPS: 'FAKE_GPS',
  OUTSIDE_GEOFENCE: 'OUTSIDE_GEOFENCE',
  MULTIPLE_CHECK_IN: 'MULTIPLE_CHECK_IN',
  MULTIPLE_DEVICE_LOGIN: 'MULTIPLE_DEVICE_LOGIN',
  LATE_ATTENDANCE: 'LATE_ATTENDANCE',
  EARLY_CHECK_OUT: 'EARLY_CHECK_OUT',
  DEVICE_MANIPULATION: 'DEVICE_MANIPULATION',
} as const;
export type ViolationType = (typeof ViolationType)[keyof typeof ViolationType];

// ── Violation severity ─────────────────────────────────────────────────
export const ViolationSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type ViolationSeverity = (typeof ViolationSeverity)[keyof typeof ViolationSeverity];

// ── Override allowed statuses (BR-OVERRIDE-001) ────────────────────────
export const OVERRIDE_ALLOWED_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.INVALID,
];

// ── Request body interfaces ────────────────────────────────────────────

export type CheckInBody = {
  latitude: number;
  longitude: number;
  accuracy: number;
  deviceId?: string;
  fakeGpsDetected?: boolean;
};

export type CheckOutBody = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type OverrideAttendanceBody = {
  /** Hanya PRESENT | INVALID yang diizinkan (BR-OVERRIDE-001). */
  status: Extract<AttendanceStatus, 'PRESENT' | 'INVALID'>;
  reason: string;
};

// ── Query interfaces ───────────────────────────────────────────────────

export type AttendanceQuery = Partial<{
  page: number;
  limit: number;
  month: number;
  year: number;
}>;

export type AttendanceHistoryQuery = Partial<{
  page: number;
  limit: number;
  month: number;
  year: number;
  internshipId: IInternship['id'];
  status: AttendanceStatus;
}>;

export type AttendanceExportQuery = Partial<{
  departmentId: IDepartment['id'];
  month: number;
  year: number;
  format: string;
}>;

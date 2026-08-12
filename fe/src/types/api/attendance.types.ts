/**
 * Tipe payload & respons modul Attendance.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/attendance.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/AttendanceController.ts).
 */

import type {
  IAttendance,
  IAttendanceLog,
  IAttendanceOverride,
  IAttendanceViolation,
} from "./model.type";

// ---------- Enum value (vocabulary backend, attendance.types.ts) ----------

export type CheckInStatus =
  | "PRESENT"
  | "LATE"
  | "PENDING_REVIEW"
  | "INVALID"
  | "ABSENT";
export type CheckOutStatus =
  | "COMPLETED"
  | "PENDING_REVIEW"
  | "INVALID"
  | "ABSENT";
export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "COMPLETED"
  | "PENDING_REVIEW"
  | "INVALID"
  | "ABSENT";

// ---------- Payload (request body / query / path params) ----------

export interface CheckInBody {
  latitude: number;
  longitude: number;
  accuracy: number;
  deviceId?: string;
  fakeGpsDetected?: boolean;
}

export interface CheckOutBody {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface OverrideAttendanceBody {
  status: "PRESENT" | "INVALID";
  reason: string;
}

export interface AttendanceParams {
  attendanceId: string;
}

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
}

export interface AttendanceHistoryQuery {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  internshipId?: string;
  status?: AttendanceStatus;
}

export interface AttendanceExportQuery {
  departmentId?: string;
  month?: number;
  year?: number;
  format?: string;
}

// ---------- Response (data dari backend) ----------

/** Log check-in / check-out (detail absensi). */
export interface AttendanceLog extends Pick<
  IAttendanceLog,
  "id" | "insideGeofence" | "fakeGpsDetected" | "createdAt"
> {
  action: "CHECK_IN" | "CHECK_OUT" | null;
  latitude: number | null;
  longitude: number | null;
  accuracyMeter: number | null;
  distanceMeter: number | null;
}

/** Data satu absensi (GET /attendance/me, GET /attendance/today, GET /attendance/:attendanceId). */
export interface AttendanceResponse extends Omit<
  IAttendance,
  "checkInStatus" | "checkOutStatus" | "attendanceStatus"
> {
  checkInStatus: CheckInStatus | null;
  checkOutStatus: CheckOutStatus | null;
  attendanceStatus: AttendanceStatus | null;
  logs?: AttendanceLog[];
}

/** Detail absensi (GET /attendance/:attendanceId) — menambahkan relasi. */
export interface AttendanceDetailResponse extends AttendanceResponse {
  intern?: { id: string; fullName: string; email: string } | null;
  department?: { id: string; name: string | null } | null;
  overrides?: Omit<IAttendanceOverride, "attendanceId">[];
  violations?: (Pick<
    IAttendanceViolation,
    "id" | "severity" | "description" | "createdAt"
  > & {
    type: string | null;
  })[];
}

/** Hasil override absensi (PATCH /attendance/:attendanceId/override). */
export interface OverrideAttendanceResponse extends Pick<
  IAttendanceOverride,
  "attendanceId"
> {
  previousStatus: AttendanceStatus | null;
  newStatus: AttendanceStatus | null;
}

/** Ringkasan absensi bulanan (GET /attendance/summary). */
export interface AttendanceSummaryResponse {
  month: number;
  year: number;
  total: number;
  present: number;
  late: number;
  completed: number;
  absent: number;
  invalid: number;
  pendingReview: number;
}

/** Baris dashboard supervisor per peserta (GET /attendance/supervisor). */
export interface AttendanceSupervisorRow {
  internship: {
    id: string | null;
    intern: { id: string; fullName: string; email: string } | null;
    department: { id: string; name: string | null } | null;
  };
  todayAttendance: AttendanceResponse | null;
}

/** Baris hasil export absensi (GET /attendance/export). */
export interface AttendanceExportRow {
  date: string;
  intern: string;
  email: string;
  department: string | null;
  office: string | null;
  checkIn: string | null;
  checkOut: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  status: string | null;
  totalWorkMinutes: number | null;
}

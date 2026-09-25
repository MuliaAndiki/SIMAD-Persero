export const AttendanceCorrectionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type AttendanceCorrectionStatusValue =
  (typeof AttendanceCorrectionStatus)[keyof typeof AttendanceCorrectionStatus];

export const AttendanceCorrectionType = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
  BOTH: 'BOTH',
  INVALID_OVERRIDE: 'INVALID_OVERRIDE',
} as const;

export type AttendanceCorrectionTypeValue =
  (typeof AttendanceCorrectionType)[keyof typeof AttendanceCorrectionType];

export interface AttendanceCorrectionItem {
  id: string;
  attendanceId: string;
  internshipId: string;
  internId: string;
  supervisorId: string | null;
  correctionType: AttendanceCorrectionTypeValue;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
  reason: string;
  evidenceFileId: string | null;
  status: AttendanceCorrectionStatusValue;
  supervisorNotes: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attendance?: {
    id: string;
    attendanceDate: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    attendanceStatus: string | null;
    checkInStatus: string | null;
    checkOutStatus: string | null;
  } | null;
  evidenceFile?: {
    id: string;
    originalName: string;
    url: string;
    mimeType?: string;
  } | null;
  intern?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  supervisor?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  internship?: {
    id: string;
    status: string;
    department?: { id: string; name: string } | null;
    officeLocation?: { id: string; name: string } | null;
  } | null;
}

export interface CreateCorrectionBody {
  attendanceId: string;
  correctionType: AttendanceCorrectionTypeValue;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  evidenceFileId?: string;
}

export interface ApproveCorrectionBody {
  supervisorNotes?: string;
}

export interface RejectCorrectionBody {
  supervisorNotes: string;
}

export interface CorrectionQuery {
  page?: number;
  limit?: number;
  status?: AttendanceCorrectionStatusValue;
  internshipId?: string;
  supervisorId?: string;
  correctionType?: AttendanceCorrectionTypeValue;
}

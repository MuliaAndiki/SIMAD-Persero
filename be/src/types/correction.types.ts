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

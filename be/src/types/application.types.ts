// Types for the Internship Application module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §14, docs/05-state-machine.md §8
import type { IDepartment, IFile, IOfficeLocation, IUser } from './models.types';

/** Application status values matching Prisma schema comment & state machine. */
export const ApplicationStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESUBMITTED: 'RESUBMITTED',
} as const;

export type ApplicationStatusValue = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/** Statuses considered "active" — only one active application per intern. */
export const ACTIVE_APPLICATION_STATUSES: ApplicationStatusValue[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
  ApplicationStatus.RESUBMITTED,
];

/** Valid status transitions (current → allowed next). */
export const APPLICATION_TRANSITIONS: Record<ApplicationStatusValue, ApplicationStatusValue[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW],
  [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.RESUBMITTED],
  [ApplicationStatus.RESUBMITTED]: [ApplicationStatus.SUBMITTED],
};

/** POST /applications body — tanggal dikirim sebagai ISO string (API layer). */
export type CreateApplicationBody = {
  requestedStartDate: string;
  requestedEndDate: string;
  /** Teks opsional di API — disimpan `null` di DB bila tidak diisi. */
  motivation?: string;
  coverLetterFileId: IFile['id'];
};

/** PATCH /applications/:id body (draft edit) */
export type UpdateApplicationBody = Partial<CreateApplicationBody>;

/** PATCH /applications/:id/approve body */
export type ApproveApplicationBody = {
  departmentId: IDepartment['id'];
  officeLocationId?: IOfficeLocation['id'];
  supervisorId: IUser['id'];
  notes?: string;
};

/** PATCH /applications/:id/reject body */
export type RejectApplicationBody = {
  reason: string;
};

/** GET /applications query (HR list) */
export type ApplicationQuery = Partial<{
  page: number;
  limit: number;
  status: ApplicationStatusValue;
  keyword: string;
  institution: string;
}>;

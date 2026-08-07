// Types for the Internship module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §15, docs/05-state-machine.md §9
import type { IDepartment, IInternship, IOfficeLocation, IUser } from './models.types';

/** Internship status values matching Prisma schema comment & state machine. */
export const InternshipStatus = {
  ONBOARDING_PENDING: 'ONBOARDING_PENDING',
  ONBOARDING_COMPLETED: 'ONBOARDING_COMPLETED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CERTIFICATE_GENERATED: 'CERTIFICATE_GENERATED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type InternshipStatusValue = (typeof InternshipStatus)[keyof typeof InternshipStatus];

/** Valid internship status transitions (current → allowed next). */
export const INTERNSHIP_TRANSITIONS: Record<InternshipStatusValue, InternshipStatusValue[]> = {
  [InternshipStatus.ONBOARDING_PENDING]: [InternshipStatus.ONBOARDING_COMPLETED],
  [InternshipStatus.ONBOARDING_COMPLETED]: [InternshipStatus.ACTIVE],
  [InternshipStatus.ACTIVE]: [InternshipStatus.COMPLETED],
  [InternshipStatus.COMPLETED]: [InternshipStatus.CERTIFICATE_GENERATED, InternshipStatus.ARCHIVED],
  [InternshipStatus.CERTIFICATE_GENERATED]: [InternshipStatus.ARCHIVED],
  [InternshipStatus.ARCHIVED]: [],
};

/** PATCH /internships/:id/extend body */
export type ExtendInternshipBody = {
  /** ISO date string (API layer) — disimpan sebagai Date di DB. */
  newEndDate: string;
  reason?: string;
};

/** PATCH /internships/:id/assign-supervisor body */
export type AssignSupervisorBody = {
  supervisorId: IUser['id'];
};

/** PATCH /internships/:id/change-department body */
export type ChangeDepartmentBody = {
  departmentId: IDepartment['id'];
  officeLocationId?: IOfficeLocation['id'];
};

/** GET /internships query (optional, for future list) */
export type InternshipQuery = Partial<{
  page: number;
  limit: number;
  status: InternshipStatusValue;
  keyword: string;
}>;

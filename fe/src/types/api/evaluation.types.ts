export const EvaluationStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  FINAL: 'FINAL',
} as const;

export type EvaluationStatusValue =
  (typeof EvaluationStatus)[keyof typeof EvaluationStatus];

export interface EvaluationItem {
  id: string | null;
  internshipId: string;
  supervisorId?: string;
  disciplineScore: number;
  responsibilityScore: number;
  teamworkScore: number;
  communicationScore: number;
  technicalScore: number;
  initiativeScore: number;
  finalScore: number;
  grade: string | null;
  comments: string | null;
  status: EvaluationStatusValue | string;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  supervisor?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  internship?: {
    id: string;
    status: string;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    department?: { id: string; name: string; code: string | null } | null;
    officeLocation?: { id: string; name: string | null } | null;
    internProfile?: {
      id: string;
      studentNumber: string;
      user: { id: string; fullName: string; email: string };
      institution: { id: string; name: string | null } | null;
      major: { id: string; name: string | null } | null;
    } | null;
  } | null;
}

export interface SaveEvaluationBody {
  disciplineScore: number;
  responsibilityScore: number;
  teamworkScore: number;
  communicationScore: number;
  technicalScore: number;
  initiativeScore: number;
  comments?: string;
}

export interface EvaluationQuery {
  page?: number;
  limit?: number;
  status?: EvaluationStatusValue | string;
  supervisorId?: string;
  departmentId?: string;
  officeLocationId?: string;
  keyword?: string;
}

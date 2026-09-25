export const EvaluationStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  FINAL: 'FINAL',
} as const;

export type EvaluationStatusValue =
  (typeof EvaluationStatus)[keyof typeof EvaluationStatus];

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
  status?: EvaluationStatusValue;
  supervisorId?: string;
  departmentId?: string;
  officeLocationId?: string;
  keyword?: string;
}

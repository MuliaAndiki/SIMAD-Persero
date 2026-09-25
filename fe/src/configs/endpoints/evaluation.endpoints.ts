export const EVALUATION_ENDPOINTS = {
  GET_BY_INTERNSHIP: (internshipId: string) => `/supervisor/internships/${internshipId}/evaluation`,
  SAVE_DRAFT: (internshipId: string) => `/supervisor/internships/${internshipId}/evaluation`,
  UPDATE_DRAFT: (internshipId: string) => `/supervisor/internships/${internshipId}/evaluation`,
  SUBMIT_FINAL: (internshipId: string) => `/supervisor/internships/${internshipId}/evaluation/submit`,
  HR_LIST: '/hr-admin/evaluations',
} as const;

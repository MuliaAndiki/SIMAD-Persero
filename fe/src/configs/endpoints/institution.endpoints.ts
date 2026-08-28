export const INSTITUTION_ENDPOINTS = {
  LIST: '/institutions',
  EDUCATION_LEVELS: '/institutions/education-levels',
  DETAIL: (id: string) => `/institutions/${id}`,
  CREATE: '/institutions',
  UPDATE: (id: string) => `/institutions/${id}`,
  DELETE: (id: string) => `/institutions/${id}`,
} as const;

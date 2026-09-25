export const QUOTA_ENDPOINTS = {
  LIST: '/internship-quotas',
  AVAILABILITY: '/internship-quotas/availability',
  CREATE: '/internship-quotas',
  DETAIL: (id: string) => `/internship-quotas/${id}`,
  UPDATE: (id: string) => `/internship-quotas/${id}`,
  DELETE: (id: string) => `/internship-quotas/${id}`,
} as const;

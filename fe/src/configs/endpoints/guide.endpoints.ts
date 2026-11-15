export const GUIDE_ENDPOINTS = {
  LIST: '/guides',
  DETAIL: (slug: string) => `/guides/${slug}`,
  CREATE: '/guides',
  UPDATE: (id: string) => `/guides/${id}`,
  UPDATE_STATUS: (id: string) => `/guides/${id}/status`,
  DELETE: (id: string) => `/guides/${id}`,
} as const;

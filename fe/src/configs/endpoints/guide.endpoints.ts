export const GUIDE_ENDPOINTS = {
  LIST: '/guides',
  DETAIL: (slug: string) => `/guides/${slug}`,
  CREATE: '/guides',
  UPDATE: (id: string) => `/guides/${id}`,
  DELETE: (id: string) => `/guides/${id}`,
} as const;

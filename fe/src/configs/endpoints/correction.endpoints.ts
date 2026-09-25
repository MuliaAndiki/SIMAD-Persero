export const CORRECTION_ENDPOINTS = {
  SUBMIT: '/attendance/corrections',
  MY_LIST: '/attendance/corrections/me',
  DETAIL: (id: string) => `/attendance/corrections/${id}`,
  CANCEL: (id: string) => `/attendance/corrections/${id}/cancel`,
  SUPERVISOR_LIST: '/supervisor/attendance-corrections',
  SUPERVISOR_APPROVE: (id: string) => `/supervisor/attendance-corrections/${id}/approve`,
  SUPERVISOR_REJECT: (id: string) => `/supervisor/attendance-corrections/${id}/reject`,
} as const;

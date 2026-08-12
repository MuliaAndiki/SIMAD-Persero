/**
 * Query key terpusat untuk React Query.
 *
 * Setiap module memiliki hierarki:
 *   <module>Root → ["<module>"]
 *   <module>     → daftar key spesifik (list / detail / resource)
 *
 * Hook query/mutation TIDAK boleh membuat query key inline — selalu
 * gunakan konstanta di file ini agar invalidation konsisten.
 */
export const queryKey = {
  authRoot: () => ['auth'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
    sessions: () => ['auth', 'sessions'] as const,
  },

  departmentRoot: () => ['department'] as const,
  department: {
    list: (query?: Record<string, any>) => ['department', 'list', query] as const,
    detail: (departmentId: string) => ['department', 'detail', departmentId] as const,
  },

  officeRoot: () => ['office'] as const,
  office: {
    list: (query?: Record<string, any>) => ['office', 'list', query] as const,
    detail: (officeId: string) => ['office', 'detail', officeId] as const,
  },

  userRoot: () => ['user'] as const,
  user: {
    profile: () => ['user', 'profile'] as const,
  },

  fileRoot: () => ['file'] as const,
  file: {
    detail: (fileId: string) => ['file', 'detail', fileId] as const,
  },

  applicationRoot: () => ['application'] as const,
  application: {
    my: () => ['application', 'my'] as const,
    list: (query?: Record<string, any>) => ['application', 'list', query] as const,
    detail: (id: string) => ['application', 'detail', id] as const,
  },

  internshipRoot: () => ['internship'] as const,
  internship: {
    my: () => ['internship', 'my'] as const,
    detail: (id: string) => ['internship', 'detail', id] as const,
  },

  institutionRoot: () => ['institution'] as const,
  institution: {
    list: (query?: Record<string, any>) => ['institution', 'list', query] as const,
    detail: (institutionId: string) => ['institution', 'detail', institutionId] as const,
  },

  attendanceRoot: () => ['attendance'] as const,
  attendance: {
    my: (query?: Record<string, any>) => ['attendance', 'my', query] as const,
    today: () => ['attendance', 'today'] as const,
    summary: (query?: Record<string, any>) => ['attendance', 'summary', query] as const,
    supervisor: () => ['attendance', 'supervisor'] as const,
    history: (query?: Record<string, any>) => ['attendance', 'history', query] as const,
    export: (query?: Record<string, any>) => ['attendance', 'export', query] as const,
    detail: (attendanceId: string) => ['attendance', 'detail', attendanceId] as const,
  },

  certificateRoot: () => ['certificate'] as const,
  certificate: {
    verify: (verificationCode: string) => ['certificate', 'verify', verificationCode] as const,
    my: () => ['certificate', 'my'] as const,
    detail: (certificateId: string) => ['certificate', 'detail', certificateId] as const,
  },

  notificationRoot: () => ['notification'] as const,
  notification: {
    list: (query?: Record<string, any>) => ['notification', 'list', query] as const,
    unreadCount: () => ['notification', 'unreadCount'] as const,
    detail: (notificationId: string) => ['notification', 'detail', notificationId] as const,
  },

  supervisorRoot: () => ['supervisor'] as const,
  supervisor: {
    dashboard: () => ['supervisor', 'dashboard'] as const,
    list: (query?: Record<string, any>) => ['supervisor', 'list', query] as const,
    detail: (supervisorId: string) => ['supervisor', 'detail', supervisorId] as const,
  },

  reportingRoot: () => ['reporting'] as const,
  reporting: {
    attendance: (query?: Record<string, any>) => ['reporting', 'attendance', query] as const,
    internships: () => ['reporting', 'internships'] as const,
    certificates: () => ['reporting', 'certificates'] as const,
    dashboard: () => ['reporting', 'dashboard'] as const,
  },

  auditLogRoot: () => ['auditLog'] as const,
  auditLog: {
    list: (query?: Record<string, any>) => ['auditLog', 'list', query] as const,
    userActivity: (userId: string, query?: Record<string, any>) =>
      ['auditLog', 'userActivity', userId, query] as const,
    detail: (auditId: string) => ['auditLog', 'detail', auditId] as const,
  },

  dashboardRoot: () => ['dashboard'] as const,
  dashboard: {
    intern: () => ['dashboard', 'intern'] as const,
    hr: () => ['dashboard', 'hr'] as const,
    supervisor: () => ['dashboard', 'supervisor'] as const,
    statistics: () => ['dashboard', 'statistics'] as const,
    charts: () => ['dashboard', 'charts'] as const,
    recentActivities: (query?: Record<string, any>) =>
      ['dashboard', 'recentActivities', query] as const,
  },
} as const;

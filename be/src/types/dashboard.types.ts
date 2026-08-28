// Types for the Dashboard module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §19, docs/04-business-rules.md §27
import type {
  IActivityLog,
  IAttendance,
  ICertificate,
  IDepartment,
  IInternship,
  INotification,
  INotificationRead,
  IOfficeLocation,
  IUser,
} from './models.types';

/** GET /dashboard/recent-activities query. */
export type RecentActivityQuery = Partial<{
  page: number;
  limit: number;
}>;

// ── 19.1 Intern Dashboard ──────────────────────────────────────────────

export type DashboardInternship = {
  id: IInternship['id'];
  status: IInternship['status'];
  actualStartDate: IInternship['actualStartDate'];
  actualEndDate: IInternship['actualEndDate'];
  department: Pick<IDepartment, 'id' | 'name'> | null;
  officeLocation: Pick<IOfficeLocation, 'id' | 'name'> | null;
};

export type DashboardAttendanceToday = {
  id: IAttendance['id'];
  attendanceDate: IAttendance['attendanceDate'];
  checkInAt: IAttendance['checkInAt'];
  checkOutAt: IAttendance['checkOutAt'];
  checkInStatus: IAttendance['checkInStatus'];
  checkOutStatus: IAttendance['checkOutStatus'];
  attendanceStatus: IAttendance['attendanceStatus'];
};

export type DashboardNotification = {
  id: INotification['id'];
  title: INotification['title'];
  message: INotification['message'];
  createdAt: INotification['createdAt'];
  readAt: INotificationRead['readAt'];
};

export type DashboardCertificate = {
  id: ICertificate['id'];
  certificateNumber: ICertificate['certificateNumber'];
  generatedAt: ICertificate['generatedAt'];
};

export type InternDashboardResponse = {
  internship: DashboardInternship | null;
  todayAttendance: DashboardAttendanceToday | null;
  notifications: DashboardNotification[];
  certificate: DashboardCertificate | null;
};

// ── 19.2 HR Dashboard ──────────────────────────────────────────────────

export type HrDashboardResponse = {
  pendingApplications: number;
  activeInternships: number;
  attendanceToday: number;
  certificatesGenerated: number;
  totalSupervisors: number;
};

// ── 19.3 Supervisor Dashboard ──────────────────────────────────────────

export type SupervisorDashboardData = {
  departmentParticipants: number;
  notCheckedIn: number;
  present: number;
  invalidAttendance: number;
};

// ── Receptionist Dashboard ─────────────────────────────────────────────

export type ReceptionistDashboardData = {
  activeInternsCount: number;
  presentTodayCount: number;
  pendingCheckInCount: number;
  recentAttendances: Array<{
    id: string;
    internName: string;
    internEmail: string;
    departmentName: string | null;
    officeName: string | null;
    checkInAt: Date | string | null;
    checkInStatus: string | null;
    attendanceStatus: string | null;
  }>;
};

// ── 19.4 Dashboard Statistics ──────────────────────────────────────────

export type DashboardStatistics = {
  totalUsers: number;
  totalInterns: number;
  totalDepartments: number;
  totalOffices: number;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  activeInternships: number;
  completedInternships: number;
  totalSupervisors: number;
  totalAttendance: number;
  attendanceToday: number;
  certificatesGenerated: number;
};

// ── 19.5 Dashboard Chart ───────────────────────────────────────────────

export type AttendanceTrendPoint = {
  month: string;
  present: number;
  late: number;
  invalid: number;
};

export type InternshipTrendPoint = {
  month: string;
  started: number;
  completed: number;
};

export type DepartmentDistributionPoint = {
  department: string;
  internCount: number;
};

export type ChartsResponse = {
  attendanceTrend: AttendanceTrendPoint[];
  internshipTrend: InternshipTrendPoint[];
  departmentDistribution: DepartmentDistributionPoint[];
};

// ── 19.6 Recent Activities ─────────────────────────────────────────────

export type RecentActivityResponse = {
  id: IActivityLog['id'];
  user: Pick<IUser, 'id' | 'fullName' | 'email'> | null;
  activity: IActivityLog['activity'];
  description: IActivityLog['description'];
  createdAt: IActivityLog['createdAt'];
};

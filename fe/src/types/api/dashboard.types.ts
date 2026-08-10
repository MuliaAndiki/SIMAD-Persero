/**
 * Tipe payload & respons modul Dashboard.
 *
 * Nama field query disamakan dengan DTO backend (be/src/dtos/dashboard.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/DashboardController.ts).
 */

// ---------- Payload (query) ----------

export interface RecentActivityQuery {
  page?: number;
  limit?: number;
}

/** Role pengguna yang menentukan varian dashboard (GET /dashboard/:role). */
export type DashboardRole = 'INTERN' | 'HR_ADMIN' | 'SUPERVISOR';

// ---------- Response (data dari backend) ----------

/** Data internship di dashboard intern (GET /dashboard/intern). */
export interface DashboardInternship {
  id: string;
  status: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  department: { id: string; name: string | null } | null;
  officeLocation: { id: string; name: string } | null;
}

/** Absensi hari ini di dashboard intern. */
export interface DashboardAttendanceToday {
  id: string;
  attendanceDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  attendanceStatus: string | null;
}

/** Notifikasi di dashboard intern. */
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

/** Sertifikat di dashboard intern. */
export interface DashboardCertificate {
  id: string;
  certificateNumber: string;
  generatedAt: string;
}

/** Respons dashboard intern (GET /dashboard/intern). */
export interface InternDashboardResponse {
  internship: DashboardInternship | null;
  todayAttendance: DashboardAttendanceToday | null;
  notifications: DashboardNotification[];
  certificate: DashboardCertificate | null;
}

/** Respons dashboard HR (GET /dashboard/hr). */
export interface HrDashboardResponse {
  pendingApplications: number;
  activeInternships: number;
  attendanceToday: number;
  certificatesGenerated: number;
  totalSupervisors: number;
}

/** Respons dashboard supervisor (GET /dashboard/supervisor). */
export interface SupervisorDashboardData {
  departmentParticipants: number;
  notCheckedIn: number;
  present: number;
  invalidAttendance: number;
}

/** Statistik dashboard (GET /dashboard/statistics). */
export interface DashboardStatistics {
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
}

/** Titik tren absensi (GET /dashboard/charts). */
export interface AttendanceTrendPoint {
  month: string;
  present: number;
  late: number;
  invalid: number;
}

/** Titik tren magang (GET /dashboard/charts). */
export interface InternshipTrendPoint {
  month: string;
  started: number;
  completed: number;
}

/** Titik distribusi departemen (GET /dashboard/charts). */
export interface DepartmentDistributionPoint {
  department: string;
  internCount: number;
}

/** Respons grafik dashboard (GET /dashboard/charts). */
export interface ChartsResponse {
  attendanceTrend: AttendanceTrendPoint[];
  internshipTrend: InternshipTrendPoint[];
  departmentDistribution: DepartmentDistributionPoint[];
}

/** Baris aktivitas terbaru (GET /dashboard/recent-activities). */
export interface RecentActivityResponse {
  id: string;
  user: { id: string; fullName: string; email: string } | null;
  activity: string;
  description: string | null;
  createdAt: string;
}

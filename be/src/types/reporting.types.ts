// Types for the Reporting module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §26, docs/04-business-rules.md §28
import type { IAttendance, ICertificate, IDepartment, IInternship } from './models.types';

/** GET /reports/attendance query (BR-REPORT-003 / BR-REPORT-004). */
export type ReportingQuery = Partial<{
  departmentId: IDepartment['id'];
  month: number;
  year: number;
  format: string;
}>;

/** Row laporan absensi — 26.1 Attendance Report. */
export type AttendanceReportRow = {
  date: IAttendance['attendanceDate'];
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  department: string;
  office: string;
  checkInAt: IAttendance['checkInAt'];
  checkOutAt: IAttendance['checkOutAt'];
  checkInStatus: IAttendance['checkInStatus'];
  checkOutStatus: IAttendance['checkOutStatus'];
  status: IAttendance['attendanceStatus'];
  totalWorkMinutes: IAttendance['totalWorkMinutes'];
};

/** Row laporan peserta magang — 26.2 Internship Report. */
export type InternshipReportRow = {
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  major: string;
  department: string;
  office: string;
  actualStartDate: IInternship['actualStartDate'];
  actualEndDate: IInternship['actualEndDate'];
  status: IInternship['status'];
  supervisor: string;
};

/** Row laporan sertifikat — 26.3 Certificate Report. */
export type CertificateReportRow = {
  certificateNumber: string;
  intern: string;
  email: string;
  department: string;
  generatedAt: ICertificate['generatedAt'];
  generatedBy: string;
};

/** Ringkasan laporan dashboard — 26.4 Dashboard Report. */
export type DashboardReportData = {
  totalDepartments: number;
  totalOffices: number;
  totalInterns: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  activeInternships: number;
  completedInternships: number;
  totalSupervisors: number;
  totalAttendance: number;
  attendanceToday: number;
  certificatesGenerated: number;
};

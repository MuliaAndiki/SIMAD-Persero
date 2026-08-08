/**
 * Tipe payload & respons modul Reporting.
 *
 * Nama field query disamakan dengan DTO backend (be/src/dtos/reporting.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/ReportingController.ts).
 */

// ---------- Payload (query) ----------

export interface ReportingQuery {
  departmentId?: string;
  month?: number;
  year?: number;
  format?: string;
}

// ---------- Response (data dari backend) ----------

/** Baris laporan absensi (GET /reports/attendance). */
export interface AttendanceReportRow {
  date: string;
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  department: string;
  office: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  status: string | null;
  totalWorkMinutes: number | null;
}

/** Baris laporan peserta magang (GET /reports/internships). */
export interface InternshipReportRow {
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  major: string;
  department: string;
  office: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: string | null;
  supervisor: string;
}

/** Baris laporan sertifikat (GET /reports/certificates). */
export interface CertificateReportRow {
  certificateNumber: string;
  intern: string;
  email: string;
  department: string;
  generatedAt: string | null;
  generatedBy: string;
}

/** Ringkasan laporan dashboard (GET /reports/dashboard). */
export interface DashboardReportData {
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
}

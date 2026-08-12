/**
 * Tipe payload & respons modul Reporting.
 *
 * Nama field query disamakan dengan DTO backend (be/src/dtos/reporting.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/ReportingController.ts).
 */

import type { IAttendance, ICertificate, IInternship } from "./model.type";

// ---------- Payload (query) ----------

export interface ReportingQuery {
  departmentId?: string;
  month?: number;
  year?: number;
  format?: string;
}

// ---------- Response (data dari backend) ----------

/** Baris laporan absensi (GET /reports/attendance). */
export interface AttendanceReportRow extends Pick<
  IAttendance,
  | "checkInAt"
  | "checkOutAt"
  | "checkInStatus"
  | "checkOutStatus"
  | "totalWorkMinutes"
> {
  date: string;
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  department: string;
  office: string;
  status: string | null;
}

/** Baris laporan peserta magang (GET /reports/internships). */
export interface InternshipReportRow extends Pick<
  IInternship,
  "actualStartDate" | "actualEndDate" | "status"
> {
  intern: string;
  email: string;
  studentNumber: string;
  institution: string;
  major: string;
  department: string;
  office: string;
  supervisor: string;
}

/** Baris laporan sertifikat (GET /reports/certificates). */
export interface CertificateReportRow extends Pick<
  ICertificate,
  "certificateNumber" | "generatedAt"
> {
  intern: string;
  email: string;
  department: string;
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

/**
 * Tipe payload & respons modul Supervisor.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/supervisor.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/SupervisorController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

export interface SupervisorQuery {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface AssignInternBody {
  internshipId: string;
}

export interface SupervisorParams {
  supervisorId: string;
}

export interface SupervisorAssignmentParams {
  supervisorId: string;
  assignmentId: string;
}

// ---------- Response (data dari backend) ----------

/** Referensi user (intern) yang di-embed di respons assignment. */
export interface SupervisorInternRef {
  id: string;
  fullName: string;
  email: string;
  studentNumber: string | null;
}

/** Data satu supervisor (GET /supervisors, GET /supervisors/:supervisorId). */
export interface SupervisorResponse {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  avatarFileId: string | null;
  createdAt: string | null;
  activeAssignmentsCount: number;
}

/** Data satu penugasan supervisor ke internship. */
export interface SupervisorAssignmentResponse {
  id: string;
  internshipId: string;
  supervisorId: string;
  assignedById: string;
  assignedAt: string | null;
  endedAt: string | null;
  isActive: boolean;
  internship: {
    id: string;
    status: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    intern: SupervisorInternRef | null;
    department: { id: string; name: string | null } | null;
  } | null;
}

/** Detail supervisor (GET /supervisors/:supervisorId) — termasuk daftar assignment. */
export interface SupervisorDetailResponse extends SupervisorResponse {
  assignments: SupervisorAssignmentResponse[];
}

/** Dashboard supervisor (GET /supervisors/dashboard). */
export interface SupervisorDashboardResponse {
  totalAssignments: number;
  activeAssignments: number;
  activeInternships: number;
  todayAttendance: number;
  totalInterns: number;
  recentAssignments: SupervisorAssignmentResponse[];
}

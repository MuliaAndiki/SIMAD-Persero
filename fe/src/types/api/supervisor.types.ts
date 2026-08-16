/**
 * Tipe payload & respons modul Supervisor.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/supervisor.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/SupervisorController.ts).
 */

import type { ISupervisorAssignment, IUser } from "./model.type";

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
export interface SupervisorInternRef extends Pick<
  IUser,
  "id" | "fullName" | "email"
> {
  studentNumber: string | null;
}

/** Data satu supervisor (GET /supervisors, GET /supervisors/:supervisorId). */
export interface SupervisorResponse extends Pick<
  IUser,
  "id" | "fullName" | "email" | "isActive" | "avatarFileId" | "createdAt"
> {
  activeAssignmentsCount: number;
  departmentId: string | null;
}

/** Data satu penugasan supervisor ke internship. */
export interface SupervisorAssignmentResponse extends Omit<
  ISupervisorAssignment,
  "internshipId" | "supervisorId" | "assignedById"
> {
  internshipId: string;
  supervisorId: string;
  assignedById: string;
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

export interface CreateSupervisorBody {
  fullName: string;
  email: string;
  departmentId: string;
  password?: string;
}

export type UpdateSupervisorBody = Partial<CreateSupervisorBody> & {
  isActive?: boolean;
  password?: string;
};

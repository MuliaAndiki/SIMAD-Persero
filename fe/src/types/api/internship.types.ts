/**
 * Tipe payload & respons modul Internship.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/internship.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/InternshipController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

/** Status magang — cocok dengan vocabulary backend (internship.types.ts). */
export type InternshipStatusValue =
  | 'ONBOARDING_PENDING'
  | 'ONBOARDING_COMPLETED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CERTIFICATE_GENERATED'
  | 'ARCHIVED';

export interface InternshipParams {
  id: string;
}

export interface ExtendInternshipBody {
  newEndDate: string;
  reason?: string;
}

export interface AssignSupervisorBody {
  supervisorId: string;
}

export interface ChangeDepartmentBody {
  departmentId: string;
  officeLocationId?: string;
}

export interface InternshipQuery {
  page?: number;
  limit?: number;
  status?: InternshipStatusValue;
  keyword?: string;
}

// ---------- Response (data dari backend) ----------

/** Referensi user (intern / supervisor) yang di-embed di respons internship. */
export interface InternshipUserRef {
  id: string;
  fullName: string;
  email: string;
}

/** Data satu internship (GET /internships/me, GET /internships/:id). */
export interface InternshipResponse {
  id: string;
  applicationId: string | null;
  internProfileId: string | null;
  departmentId: string | null;
  officeLocationId: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: InternshipStatusValue | null;
  onboardingCompleted: boolean;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  department?: { id: string; code: string; name: string | null } | null;
  officeLocation?: { id: string; name: string; address?: string | null } | null;
  application?: {
    id: string;
    applicationNumber: string | null;
    status: string | null;
    requestedStartDate?: string | null;
    requestedEndDate?: string | null;
  } | null;
  supervisorAssignments?: {
    id: string;
    supervisor: InternshipUserRef;
    assignedAt: string | null;
  }[];
  internProfile?: {
    id: string;
    studentNumber: string;
    user: InternshipUserRef;
    institution: { id: string; name: string } | null;
    major: { id: string; name: string } | null;
  } | null;
}

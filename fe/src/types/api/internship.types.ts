/**
 * Tipe payload & respons modul Internship.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/internship.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/InternshipController.ts).
 */

import type {
  IInternProfile,
  IInternship,
  IInstitutionMajor,
  IUser,
} from "./model.type";

// ---------- Payload (request body / query / path params) ----------

/** Status magang — cocok dengan vocabulary backend (internship.types.ts). */
export type InternshipStatusValue =
  | "ONBOARDING_PENDING"
  | "ONBOARDING_COMPLETED"
  | "ACTIVE"
  | "COMPLETED"
  | "CERTIFICATE_GENERATED"
  | "ARCHIVED";

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

/** POST /internships/profile — Simpan data profil peserta magang (INTERN). */

// ---------- Response (data dari backend) ----------

/** Referensi user (intern / supervisor) yang di-embed di respons internship. */
export interface InternshipUserRef extends Pick<
  IUser,
  "id" | "fullName" | "email"
> {}

/** Data satu internship (GET /internships/me, GET /internships/:id). */
export interface InternshipResponse extends Omit<IInternship, "status"> {
  status: InternshipStatusValue | null;
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

/** Data profil peserta magang (IInternProfile). */
export interface InternProfileResponse extends Omit<
  IInternProfile,
  | "phone"
  | "studentNumber"
  | "address"
  | "bio"
  | "birthDate"
  | "birthPlace"
  | "emergencyContact"
  | "gender"
  | "userId"
  | "institutionId"
  | "majorId"
> {
  phone: string | null;
  studentNumber: string | null;
  address: string | null;
  bio: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  emergencyContact: string | null;
  gender: string | null;
  userId: string | null;
  institutionId: string | null;
  majorId: string | null;
}

/** Respons POST /internships/profile — [institutionMajor, internProfile]. */
export type CreateInternProfileResponse = [
  Pick<IInstitutionMajor, "id">,
  InternProfileResponse,
];

export type PickCreateInternshipProfile = Pick<
  IInternProfile,
  | "address"
  | "bio"
  | "birthDate"
  | "birthPlace"
  | "emergencyContact"
  | "gender"
  | "phone"
  | "studentNumber"
  | "userId"
  | "majorId"
  | "institutionId"
  | "id"
>;

export type PickCreateInternshipMajor = Pick<
  IInstitutionMajor,
  "name" | "institutionId"
>;

export type PickMergeInternship = PickCreateInternshipProfile &
  PickCreateInternshipMajor;

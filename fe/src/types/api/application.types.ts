/**
 * Tipe payload & respons modul Internship Application.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/application.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/ApplicationController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

/** Status aplikasi magang — cocok dengan vocabulary backend (application.types.ts). */
export type ApplicationStatusValue =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMITTED';

export interface CreateApplicationBody {
  requestedStartDate: string;
  requestedEndDate: string;
  motivation?: string;
  coverLetterFileId: string;
}

export interface UpdateApplicationBody {
  requestedStartDate?: string;
  requestedEndDate?: string;
  motivation?: string;
  coverLetterFileId?: string;
}

export interface ApproveApplicationBody {
  departmentId: string;
  officeLocationId?: string;
  supervisorId: string;
  notes?: string;
}

export interface RejectApplicationBody {
  reason: string;
}

export interface ApplicationParams {
  id: string;
}

export interface ApplicationQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatusValue;
  keyword?: string;
  institution?: string;
}

// ---------- Response (data dari backend) ----------

/** Referensi file surat pengantar yang di-embed di respons aplikasi. */
export interface ApplicationFileRef {
  id: string;
  originalName: string;
  mimeType: string;
  url: string;
}

/** Referensi user (pemilik / reviewer). */
export interface ApplicationUserRef {
  id: string;
  fullName: string;
  email: string;
}

/** Profil intern yang di-embed di respons aplikasi (list/detail). */
export interface ApplicationInternProfile {
  id: string;
  studentNumber: string;
  user: ApplicationUserRef;
  institution: { id: string; name: string } | null;
  major: { id: string; name: string } | null;
  phone?: string | null;
  profileSkills?: { skill: { id: string; name: string; category: string } }[];
}

/** Data satu aplikasi magang (GET /applications/me, GET /applications/:id, ...). */
export interface ApplicationResponse {
  id: string;
  internProfileId: string;
  applicationNumber: string | null;
  introductionLetterFileId: string;
  requestedStartDate: string | null;
  requestedEndDate: string | null;
  motivation: string | null;
  status: ApplicationStatusValue | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  introductionLetterFile?: ApplicationFileRef | null;
  internProfile?: ApplicationInternProfile | null;
  reviewedBy?: ApplicationUserRef | null;
  internship?: { id: string; status: string | null } | null;
}

/** Hasil approve aplikasi — aplikasi ter-update + internship baru dibuat. */
export interface ApproveApplicationResponse {
  application: ApplicationResponse;
  internship: {
    id: string;
    applicationId: string | null;
    internProfileId: string | null;
    departmentId: string | null;
    officeLocationId: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    status: string | null;
    onboardingCompleted: boolean;
    completedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

/**
 * Tipe payload & respons modul Internship Application.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/application.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/ApplicationController.ts).
 */

import type { IInternship, IInternshipApplication } from './model.type';

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
  officeLocationId: string;
}

export type UpdateApplicationBody = Partial<CreateApplicationBody>;

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
  departmentId?: string;
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

/** Referensi kantor tujuan yang dipilih intern saat pengajuan. */
export interface ApplicationOfficeRef {
  id: string;
  name: string | null;
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
export interface ApplicationResponse extends Omit<IInternshipApplication, 'status'> {
  status: ApplicationStatusValue | null;
  introductionLetterFile?: ApplicationFileRef | null;
  internProfile?: ApplicationInternProfile | null;
  reviewedBy?: ApplicationUserRef | null;
  officeLocation?: ApplicationOfficeRef | null;
  internship?: {
    id: string;
    status: string | null;
    department?: { id: string; name: string; code?: string } | null;
  } | null;
}

/** Hasil approve aplikasi — aplikasi ter-update + internship baru dibuat. */
export interface ApproveApplicationResponse {
  application: ApplicationResponse;
  internship: IInternship;
}

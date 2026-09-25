/**
 * Tipe payload & respons modul Internship Application.
 */

import type { IInternship, IInternshipApplication } from './model.type';

// ---------- Payload (request body / query / path params) ----------

/** Status aplikasi magang */
export type ApplicationStatusValue =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMITTED';

export const ApplicationDocumentType = {
  CV: 'CV',
  FACULTY_REQUEST_LETTER: 'FACULTY_REQUEST_LETTER',
  OTHER: 'OTHER',
} as const;

export type ApplicationDocumentTypeValue =
  (typeof ApplicationDocumentType)[keyof typeof ApplicationDocumentType];

export interface CreateApplicationBody {
  requestedStartDate: string;
  requestedEndDate: string;
  motivation?: string;
  coverLetterFileId?: string;
  cvFileId?: string;
  facultyLetterFileId?: string;
  officeLocationId: string;
}

export type UpdateApplicationBody = Partial<CreateApplicationBody>;

export interface ApproveApplicationBody {
  departmentId: string;
  officeLocationId?: string;
  supervisorId: string;
  actualStartDate?: string;
  actualEndDate?: string;
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
  officeLocationId?: string;
}

// ---------- Response (data dari backend) ----------

/** Referensi file dokumen */
export interface ApplicationFileRef {
  id: string;
  originalName: string;
  mimeType: string;
  url: string;
  size?: number | null;
}

export interface ApplicationDocumentItem {
  id: string;
  applicationId: string;
  fileId: string;
  type: ApplicationDocumentTypeValue | string;
  createdAt: string;
  file?: ApplicationFileRef | null;
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
  address?: string | null;
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

export interface ApplicationResponse extends Omit<IInternshipApplication, 'status'> {
  status: ApplicationStatusValue | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  introductionLetterFile?: ApplicationFileRef | null;
  documents?: ApplicationDocumentItem[];
  internProfile?: ApplicationInternProfile | null;
  reviewedBy?: ApplicationUserRef | null;
  officeLocation?: ApplicationOfficeRef | null;
  internship?: {
    id: string;
    status: string | null;
    department?: { id: string; name: string; code?: string } | null;
  } | null;
}

export type ApproveApplicationResponse = ApplicationResponse;


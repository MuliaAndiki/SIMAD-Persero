/**
 * Tipe payload & respons modul Certificate.
 */

import type { ICertificate } from './model.type';

export const CertificateApprovalStatus = {
  WAITING_EVALUATION: 'WAITING_EVALUATION',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  APPROVED: 'APPROVED',
  GENERATED: 'GENERATED',
  REJECTED: 'REJECTED',
} as const;

export type CertificateApprovalStatusValue =
  (typeof CertificateApprovalStatus)[keyof typeof CertificateApprovalStatus];

// ---------- Payload (request body / path params) ----------

export interface GenerateCertificateBody extends Pick<ICertificate, 'internshipId'> {}

export interface ApproveCertificateBody {
  notes?: string;
}

export interface RejectCertificateBody {
  reason: string;
}

export interface CertificateParams {
  certificateId: string;
}

export interface CertificateVerifyParams {
  verificationCode: string;
}

export interface CertificateSettingsResponse {
  signerName: string;
  signerRole: string;
  signatureUrl?: string;
  templateUrl?: string;
}

export interface OfficeCertificateSettingResponse {
  id: string | null;
  officeLocationId: string | null;
  signerName: string;
  signerRole: string;
  signatureFileId?: string | null;
  stampFileId?: string | null;
  templateFileId?: string | null;
  certificateNumberFormat: string;
  isActive: boolean;
  officeLocation?: {
    id: string;
    name: string | null;
    address: string | null;
  } | null;
  signatureFile?: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  stampFile?: {
    id: string;
    url: string;
    originalName: string;
  } | null;
}

export interface UpsertOfficeCertificateSettingBody {
  officeLocationId: string;
  signerName: string;
  signerRole: string;
  signatureFileId?: string;
  stampFileId?: string;
  templateFileId?: string;
  certificateNumberFormat?: string;
  isActive?: boolean;
}

export interface UpdateCertificateSettingsBody {
  signerName?: string;
  signerRole?: string;
  signatureUrl?: string;
  templateUrl?: string;
}

export interface CertificateQuery {
  page?: number;
  limit?: number;
  approvalStatus?: CertificateApprovalStatusValue | string;
  officeLocationId?: string;
  departmentId?: string;
  keyword?: string;
}

// ---------- Response (data dari backend) ----------

/** Sertifikat hasil serialisasi backend */
export interface CertificateResponse
  extends Omit<
    ICertificate,
    | 'internshipId'
    | 'certificateNumber'
    | 'templateId'
    | 'fileId'
    | 'generatedById'
    | 'generatedAt'
    | 'verificationToken'
    | 'createdAt'
  > {
  internshipId: string;
  certificateNumber: string;
  templateId: string;
  fileId: string;
  fileUrl: string | null;
  approvalStatus?: CertificateApprovalStatusValue | string;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  evaluationId?: string | null;
  generatedById: string;
  generatedBy: string | null;
  generatedAt: string;
  verificationToken: string;
  createdAt: string;
  internship?: {
    id: string;
    status: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    department: { id: string; code: string; name: string | null } | null;
    officeLocation?: { id: string; name: string | null } | null;
    intern: {
      id: string;
      fullName: string;
      email: string;
      studentNumber: string | null;
    } | null;
    evaluation?: {
      id: string;
      finalScore: number;
      grade: string | null;
      status: string;
    } | null;
  } | null;
}

/** Detail sertifikat (GET /certificates/:certificateId) — termasuk file & template. */
export interface CertificateDetailResponse extends CertificateResponse {
  file?: {
    id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number | null;
    url: string;
  } | null;
  template?: {
    id: string;
    name: string;
    isDefault: boolean;
  } | null;
}

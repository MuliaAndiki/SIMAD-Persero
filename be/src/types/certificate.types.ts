// Types for the Certificate module.
import type {
  ICertificate,
  ICertificateTemplate,
  IDepartment,
  IFile,
  IInternProfile,
  IInternship,
  IUser,
} from './models.types';

export const CertificateApprovalStatus = {
  WAITING_EVALUATION: 'WAITING_EVALUATION',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  APPROVED: 'APPROVED',
  GENERATED: 'GENERATED',
  REJECTED: 'REJECTED',
} as const;

export type CertificateApprovalStatusValue =
  (typeof CertificateApprovalStatus)[keyof typeof CertificateApprovalStatus];

/** POST /certificates/generate body */
export type GenerateCertificateBody = {
  internshipId: IInternship['id'];
};

/** PATCH /certificates/:id/approve */
export type ApproveCertificateBody = {
  notes?: string;
};

/** PATCH /certificates/:id/reject */
export type RejectCertificateBody = {
  reason: string;
};

/** POST/PATCH /certificate-settings body */
export type UpsertCertificateSettingBody = {
  officeLocationId: string;
  signerName: string;
  signerRole: string;
  signatureFileId?: string;
  stampFileId?: string;
  templateFileId?: string;
  certificateNumberFormat?: string;
  isActive?: boolean;
};

/** GET /certificates query */
export type CertificateQuery = Partial<{
  page: number;
  limit: number;
  status: string;
  approvalStatus: CertificateApprovalStatusValue;
  officeLocationId: string;
  departmentId: string;
  keyword: string;
}>;

/** Serialized certificate returned to clients. */
export type CertificateResponse = {
  id: ICertificate['id'];
  internshipId: ICertificate['internshipId'];
  certificateNumber: ICertificate['certificateNumber'];
  templateId: ICertificate['templateId'];
  fileId: ICertificate['fileId'];
  fileUrl: string | null;
  approvalStatus?: CertificateApprovalStatusValue | string;
  approvedById?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  evaluationId?: string | null;
  generatedById: ICertificate['generatedById'];
  generatedBy: string | null;
  generatedAt: ICertificate['generatedAt'];
  verificationToken: ICertificate['verificationToken'];
  createdAt: ICertificate['createdAt'];
  internship?: {
    id: IInternship['id'];
    status: IInternship['status'];
    actualStartDate: IInternship['actualStartDate'];
    actualEndDate: IInternship['actualEndDate'];
    department: Pick<IDepartment, 'id' | 'code' | 'name'> | null;
    officeLocation?: { id: string; name: string } | null;
    intern: {
      id: IUser['id'];
      fullName: IUser['fullName'];
      email: IUser['email'];
      studentNumber: IInternProfile['studentNumber'] | null;
    } | null;
    evaluation?: {
      id: string;
      finalScore: number;
      grade: string;
      status: string;
    } | null;
  } | null;
};

/** Detail sertifikat (17.3) — termasuk file & template. */
export type CertificateDetailResponse = CertificateResponse & {
  file?: {
    id: IFile['id'];
    originalName: IFile['originalName'];
    fileName: IFile['fileName'];
    mimeType: IFile['mimeType'];
    size: number | null;
    url: IFile['url'];
  } | null;
  template?: {
    id: ICertificateTemplate['id'];
    name: ICertificateTemplate['name'];
    isDefault: ICertificateTemplate['isDefault'];
  } | null;
};

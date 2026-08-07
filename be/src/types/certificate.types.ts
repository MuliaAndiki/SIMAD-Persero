// Types for the Certificate module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §17, docs/04-business-rules.md §23
import type {
  ICertificate,
  ICertificateTemplate,
  IDepartment,
  IFile,
  IInternProfile,
  IInternship,
  IUser,
} from './models.types';

/** POST /certificates/generate body */
export type GenerateCertificateBody = {
  internshipId: IInternship['id'];
};

/** GET /certificates query */
export type CertificateQuery = Partial<{
  page: number;
  limit: number;
}>;

/** Serialized certificate returned to clients. */
export type CertificateResponse = {
  id: ICertificate['id'];
  internshipId: ICertificate['internshipId'];
  certificateNumber: ICertificate['certificateNumber'];
  templateId: ICertificate['templateId'];
  fileId: ICertificate['fileId'];
  fileUrl: string | null;
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
    intern: {
      id: IUser['id'];
      fullName: IUser['fullName'];
      email: IUser['email'];
      studentNumber: IInternProfile['studentNumber'] | null;
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

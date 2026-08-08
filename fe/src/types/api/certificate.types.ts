/**
 * Tipe payload & respons modul Certificate.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/certificate.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/CertificateController.ts).
 */

// ---------- Payload (request body / path params) ----------

export interface GenerateCertificateBody {
  internshipId: string;
}

export interface CertificateParams {
  certificateId: string;
}

export interface CertificateVerifyParams {
  verificationCode: string;
}

// ---------- Response (data dari backend) ----------

/** Sertifikat hasil serialisasi backend (GET /certificates/me, GET /certificates/:certificateId). */
export interface CertificateResponse {
  id: string;
  internshipId: string;
  certificateNumber: string;
  templateId: string;
  fileId: string;
  fileUrl: string | null;
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
    intern: {
      id: string;
      fullName: string;
      email: string;
      studentNumber: string | null;
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

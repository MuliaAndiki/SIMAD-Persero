/**
 * Tipe payload & respons modul File.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/file.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/FileController.ts).
 */

// ---------- Payload (request body / path params) ----------

export interface FileParams {
  fileId: string;
}

// ---------- Response (data dari backend) ----------

/** Metadata file hasil upload / detail (POST /files/upload, GET /files/:fileId). */
export interface FileResponse {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  size: number | null;
  storageProvider: string;
  publicId: string;
  url: string;
  uploadedById: string;
  createdAt: string | null;
}

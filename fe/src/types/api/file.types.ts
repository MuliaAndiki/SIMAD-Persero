/**
 * Tipe payload & respons modul File.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/file.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/FileController.ts).
 */

import type { IFile } from './model.type';

// ---------- Payload (request body / path params) ----------

export interface FileParams {
  fileId: string;
}

// ---------- Response (data dari backend) ----------

/** Metadata file hasil upload / detail (POST /files/upload, GET /files/:fileId). */
export interface FileResponse
  extends Pick<
    IFile,
    | 'id'
    | 'originalName'
    | 'fileName'
    | 'mimeType'
    | 'extension'
    | 'size'
    | 'storageProvider'
    | 'publicId'
    | 'url'
    | 'uploadedById'
    | 'createdAt'
  > {}

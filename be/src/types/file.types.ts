/**
 * Types modul File.
 * Menjaga kontrak data antara controller, service, dan routes.
 * Diturunkan dari base model `IFile` (models.types.ts) memakai Utility Types.
 * Sumber aturan: docs/07-api-specification.md §25.
 */
import type { IFile } from './models.types';

export type FileParams = {
  fileId: IFile['id'];
};

/** Input upload dari service layer (buffer hasil parsing multipart). */
export type UploadFileInput = {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export type FileResponse = Omit<IFile, 'deletedAt' | 'size'> & {
  /** `BigInt` DB dikonversi ke `number` oleh serializer. */
  size: number | null;
};

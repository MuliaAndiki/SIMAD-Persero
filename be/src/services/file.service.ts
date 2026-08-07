import { AppError } from '@/http/error';
import type { AuthUser } from '@/types/auth.types';
import type { FileResponse, UploadFileInput } from '@/types/file.types';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_FILE_SIZE,
  buildPublicId,
  deleteUpload,
  getExtensionFromMime,
  readUpload,
  saveUpload,
} from '@/utils/storage.util';
import prisma from '../../prisma/client';

/**
 * Service layer modul File.
 * Mengelola metadata file di tabel `files` dan penyimpanan fisik
 * (storage lokal via `@/utils/storage.util`).
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Sumber aturan: docs/07-api-specification.md §25.
 */
class FileService {
  private serialize(file: {
    id: string;
    originalName: string | null;
    fileName: string | null;
    mimeType: string | null;
    extension: string | null;
    size: bigint | null;
    storageProvider: string | null;
    publicId: string | null;
    url: string | null;
    uploadedById: string | null;
    createdAt: Date | null;
  }): FileResponse {
    return {
      id: file.id,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size != null ? Number(file.size) : null,
      storageProvider: file.storageProvider,
      publicId: file.publicId,
      url: file.url,
      uploadedById: file.uploadedById,
      createdAt: file.createdAt,
    };
  }

  // POST /files/upload
  public async upload(uploadedById: string, input: UploadFileInput) {
    const mimeType = input.mimeType;

    if (
      !ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number])
    ) {
      throw new AppError(422, 'Invalid file type. Allowed: PDF, JPG, JPEG, PNG');
    }

    if (input.size > MAX_FILE_SIZE) {
      throw new AppError(422, 'File size exceeds the 5 MB limit');
    }

    const extension = getExtensionFromMime(mimeType);
    const publicId = buildPublicId(input.originalName, mimeType);

    await saveUpload(input.buffer, publicId);

    try {
      const file = await prisma.file.create({
        data: {
          originalName: input.originalName,
          fileName: publicId,
          mimeType,
          extension,
          size: BigInt(input.size),
          storageProvider: 'local',
          publicId,
          url: null,
          uploadedById,
        },
      });

      const url = `/api/v1/files/${file.id}/download`;
      await prisma.file.update({ where: { id: file.id }, data: { url } });

      return this.serialize({ ...file, url });
    } catch (error) {
      // Gagal menyimpan metadata — bersihkan file fisik yang baru saja ditulis.
      await deleteUpload(publicId).catch(() => {});
      throw error;
    }
  }

  // GET /files/:fileId
  public async getById(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }
    return this.serialize(file);
  }

  // GET /files/:fileId/download
  public async download(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }
    if (!file.publicId) {
      throw new AppError(410, 'File content is unavailable');
    }

    try {
      const buffer = await readUpload(file.publicId);
      return { file: this.serialize(file), buffer };
    } catch {
      throw new AppError(410, 'File content is unavailable');
    }
  }

  // DELETE /files/:fileId — soft delete (deleted_at) + hapus file fisik.
  public async remove(id: string, user: AuthUser) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }

    if (file.uploadedById !== user.id && !user.roles.includes('HR_ADMIN')) {
      throw new AppError(403, 'Access denied. You can only delete your own files.');
    }

    await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (file.publicId) {
      await deleteUpload(file.publicId);
    }
  }
}

export default new FileService();

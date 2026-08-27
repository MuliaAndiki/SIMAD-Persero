import { AppError } from '@/http/error';
import type { AuthUser } from '@/types/auth.types';
import type { FileResponse, UploadFileInput } from '@/types/file.types';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_FILE_SIZE,
  buildPublicId,
  getExtensionFromMime,
} from '@/utils/storage.util';
import { deleteFromR2, uploadFile } from '@/utils/r2-utils';
import prisma from '../../prisma/client';

/**
 * Service layer modul File.
 * File diunggah langsung ke Cloudflare R2; hanya URL publik yang disimpan
 * di tabel `files` (storage_provider = 'r2'). Tidak ada penyimpanan lokal.
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

    // Upload to Cloudflare R2 — returns public URL.
    const r2Url = await uploadFile(input.buffer, publicId, mimeType);

    const file = await prisma.file.create({
      data: {
        originalName: input.originalName,
        fileName: publicId,
        mimeType,
        extension,
        size: BigInt(input.size),
        storageProvider: 'r2',
        publicId,
        url: r2Url,
        uploadedById,
      },
    });

    return this.serialize(file);
  }

  // Register file metadata using an R2 URL uploaded directly from FE
  public async saveUrl(
    uploadedById: string,
    input: {
      url: string;
      originalName: string;
      mimeType: string;
      size?: number;
    },
  ) {
    const extension = getExtensionFromMime(input.mimeType);
    const publicId = buildPublicId(input.originalName, input.mimeType);

    const file = await prisma.file.create({
      data: {
        originalName: input.originalName,
        fileName: publicId,
        mimeType: input.mimeType,
        extension,
        size: input.size ? BigInt(input.size) : null,
        storageProvider: 'r2',
        publicId,
        url: input.url,
        uploadedById,
      },
    });

    return this.serialize(file);
  }

  // GET /files/:fileId
  public async getById(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }
    return this.serialize(file);
  }

  // GET /files/:fileId/download — redirect ke URL R2 publik.
  public async download(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }
    if (!file.url) {
      throw new AppError(410, 'File content is unavailable');
    }

    // Kembalikan URL R2; controller akan redirect atau proxy sesuai kebutuhan.
    return { file: this.serialize(file), url: file.url };
  }

  // DELETE /files/:fileId — soft delete + hapus dari R2.
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

    if (file.url && file.storageProvider === 'r2') {
      await deleteFromR2(file.url).catch(() => {});
    }
  }
}

export default new FileService();

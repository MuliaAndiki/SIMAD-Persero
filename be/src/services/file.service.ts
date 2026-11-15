import { AppError } from '@/http/error';
import type { AuthUser } from '@/types/auth.types';
import type { FileResponse, UploadFileInput } from '@/types/file.types';
import {
  deleteFromR2,
  extractR2Key,
  getR2Object,
  isAllowedR2Key,
  uploadFile,
} from '@/utils/r2-utils';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_FILE_SIZE,
  TEMPLATE_WEBP_MAX_DIMENSION,
  buildPublicId,
  getExtensionFromMime,
  inferMimeFromFilename,
  optimizeUploadedMedia,
} from '@/utils/storage.util';
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
    if (
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        input.mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      throw new AppError(422, 'Invalid file type. Allowed: PDF, JPG, JPEG, PNG, WebP');
    }

    if (input.size > MAX_FILE_SIZE) {
      throw new AppError(422, 'File size exceeds the 5 MB limit');
    }

    const maxDimension =
      input.folder === 'certificate-templates' ? TEMPLATE_WEBP_MAX_DIMENSION : undefined;
    const { buffer: finalBuffer, mimeType: finalMimeType } = await optimizeUploadedMedia(
      input.buffer,
      input.mimeType,
      maxDimension,
    );

    if (finalBuffer.length > MAX_FILE_SIZE) {
      throw new AppError(422, 'File size exceeds the 5 MB limit');
    }

    const extension = getExtensionFromMime(finalMimeType);
    const publicId = buildPublicId(input.originalName, finalMimeType);

    // Upload to Cloudflare R2 — returns public URL.
    const r2Url = await uploadFile(finalBuffer, publicId, finalMimeType, input.folder);

    const file = await prisma.file.create({
      data: {
        originalName: input.originalName,
        fileName: publicId,
        mimeType: finalMimeType,
        extension,
        size: BigInt(finalBuffer.length),
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

  private async fetchR2Stream(
    key: string,
    fallbackMimeType?: string | null,
    fallbackLength?: number,
  ) {
    try {
      const s3Response = await getR2Object(key);
      if (!s3Response.Body) {
        throw new AppError(404, 'File content is empty');
      }

      const stream = (s3Response.Body as any).transformToWebStream() as ReadableStream;
      const s3Type = s3Response.ContentType;
      const inferred = inferMimeFromFilename(key);
      const contentType =
        (s3Type && !s3Type.includes('octet-stream') ? s3Type : undefined) ||
        fallbackMimeType ||
        (inferred !== 'application/octet-stream' ? inferred : 'application/pdf');

      return {
        stream,
        contentType,
        contentLength: s3Response.ContentLength || fallbackLength,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
        throw new AppError(404, 'File not found in storage');
      }
      throw new AppError(500, 'Failed to retrieve file from storage');
    }
  }

  // Stream konten file langsung dari R2 via S3 API
  public async getFileStream(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }
    if (!file.url && !file.fileName) {
      throw new AppError(410, 'File content is unavailable');
    }

    const key = extractR2Key(file.url || file.fileName!);
    const streamData = await this.fetchR2Stream(
      key,
      file.mimeType,
      file.size != null ? Number(file.size) : undefined,
    );
    return {
      file: this.serialize(file),
      ...streamData,
    };
  }

  // Stream objek R2 berdasarkan query key, url, atau fileId (untuk endpoint /files/preview)
  public async getPreviewStream(query: { key?: string; url?: string; fileId?: string }) {
    if (query.fileId) {
      const res = await this.getFileStream(query.fileId);
      return {
        stream: res.stream,
        contentType: res.contentType,
        contentLength: res.contentLength,
        filename: res.file.originalName || res.file.fileName || 'document.pdf',
      };
    }

    const raw = query.key || query.url || '';
    const key = extractR2Key(raw).trim();
    if (!key) {
      throw new AppError(400, 'Parameter key, url, atau fileId diperlukan');
    }

    if (!isAllowedR2Key(key)) {
      throw new AppError(403, 'Kunci file tidak valid atau di luar folder penyimpanan');
    }

    const streamData = await this.fetchR2Stream(key);
    return {
      ...streamData,
      filename: key.split('/').pop() || 'document.pdf',
    };
  }

  // Hapus file secara aman (soft delete + R2) apabila sudah tidak direferensikan entitas manapun.
  public async removeIfUnreferenced(fileId: string): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        _count: {
          select: {
            certificateTemplates: true,
            certificates: true,
            applicationLetters: true,
            avatarUsers: true,
            applicationDocuments: true,
            correctionEvidenceFiles: true,
            certificateSignatures: true,
            certificateStamps: true,
            certificateSettingTemplates: true,
          },
        },
      },
    });

    if (!file || file.deletedAt) return;

    const totalRefs = Object.values(file._count).reduce((sum, count) => sum + count, 0);
    if (totalRefs > 0) return;

    await prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    if (file.url && file.storageProvider === 'r2') {
      await deleteFromR2(file.url).catch(() => {});
    }
  }

  // DELETE /files/:fileId — soft delete + hapus dari R2.
  public async remove(id: string, user: AuthUser) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppError(404, 'File not found');
    }

    const roles = (user.roles ?? []).map((r) => r.toLowerCase());
    if (file.uploadedById !== user.id && !roles.includes('hr_admin')) {
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

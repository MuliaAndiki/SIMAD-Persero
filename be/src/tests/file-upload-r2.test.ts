import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import prisma from '../../prisma/client';
import app from '../app';
import { AppError } from '../http/error';
import applicationService from '../services/application.service';
import CertificateService from '../services/certificate.service';
import FileService from '../services/file.service';
import UserService from '../services/user.service';
import { deleteFromR2, extractR2Key, isAllowedR2Key, resolveR2Folder } from '../utils/r2-utils';
import {
  TEMPLATE_WEBP_MAX_DIMENSION,
  inferMimeFromFilename,
  optimizeUploadedMedia,
} from '../utils/storage.util';

async function createSamplePngBuffer(width = 1600, height = 800): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 11, g: 161, b: 185, alpha: 0.9 },
    },
  })
    .png()
    .toBuffer();
}

function stubPrismaModel(
  modelName: 'file' | 'user' | 'internshipApplication' | 'applicationDocument' | 'internProfile',
  delegate: Record<string, unknown>,
  restorers: Array<() => void>,
) {
  const prismaRecord = prisma as unknown as Record<string, unknown>;
  const originalDelegate = prismaRecord[modelName];
  prismaRecord[modelName] = delegate;
  restorers.push(() => {
    prismaRecord[modelName] = originalDelegate;
  });
}

describe('Backend R2 upload & preview consolidation', () => {
  const restorers: Array<() => void> = [];

  afterEach(() => {
    while (restorers.length > 0) {
      restorers.pop()?.();
    }
  });

  it('extractR2Key, isAllowedR2Key, and resolveR2Folder enforce safe prefixes', () => {
    expect(extractR2Key('https://pub-123.r2.dev/cv/my%20cv.pdf')).toBe('cv/my cv.pdf');
    expect(extractR2Key('https://acc.r2.cloudflarestorage.com/simad/sertifikat/cert-01.pdf')).toBe(
      'sertifikat/cert-01.pdf',
    );
    expect(extractR2Key('/avatars/avatar.webp')).toBe('avatars/avatar.webp');

    expect(isAllowedR2Key('cv/doc.pdf')).toBe(true);
    expect(isAllowedR2Key('surat-pengantar/letter.pdf')).toBe(true);
    expect(isAllowedR2Key('univImage/logo.webp')).toBe(true);
    expect(isAllowedR2Key('signatures/ttd.webp')).toBe(true);
    expect(isAllowedR2Key('certificate-templates/bg.webp')).toBe(true);
    expect(isAllowedR2Key('sertifikat/cert.pdf')).toBe(true);
    expect(isAllowedR2Key('corrections/bukti.pdf')).toBe(true);

    expect(isAllowedR2Key('')).toBe(false);
    expect(isAllowedR2Key('../etc/passwd')).toBe(false);
    expect(isAllowedR2Key('cv/../secret.pdf')).toBe(false);
    expect(isAllowedR2Key('unknown/file.pdf')).toBe(false);

    expect(resolveR2Folder('application/pdf', 'cv')).toBe('cv');
    expect(resolveR2Folder('application/pdf', 'sertifikat')).toBe('sertifikat');
    expect(resolveR2Folder('application/pdf', 'invalid-folder')).toBe('fileuniv');
    expect(resolveR2Folder('image/png')).toBe('avatars');
  });

  it('deleteFromR2 normalizes both full URLs and relative keys', async () => {
    const deletedKeys: string[] = [];
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof DeleteObjectCommand) {
        deletedKeys.push(cmd.input.Key ?? '');
      }
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    await deleteFromR2('https://pub-test.r2.dev/surat-pengantar/doc-1.pdf');
    await deleteFromR2('cv/doc-2.pdf');

    expect(deletedKeys).toEqual(['surat-pengantar/doc-1.pdf', 'cv/doc-2.pdf']);
  });

  it('optimizeUploadedMedia converts images to WebP, keeps PDFs untouched, and rejects invalid bytes', async () => {
    const pdfBuf = Buffer.from('%PDF-1.4 sample');
    const pdfResult = await optimizeUploadedMedia(pdfBuf, 'application/pdf');
    expect(pdfResult.mimeType).toBe('application/pdf');
    expect(pdfResult.buffer).toBe(pdfBuf);

    const pngBuf = await createSamplePngBuffer(1600, 800);
    const defaultImg = await optimizeUploadedMedia(pngBuf, 'image/png');
    expect(defaultImg.mimeType).toBe('image/webp');
    const defaultMeta = await sharp(defaultImg.buffer).metadata();
    expect(defaultMeta.format).toBe('webp');
    expect(defaultMeta.width).toBe(1024);
    expect(defaultMeta.height).toBe(512);

    const templateImg = await optimizeUploadedMedia(
      pngBuf,
      'image/png',
      TEMPLATE_WEBP_MAX_DIMENSION,
    );
    const templateMeta = await sharp(templateImg.buffer).metadata();
    expect(templateMeta.width).toBe(1600);
    expect(templateMeta.height).toBe(800);

    await expect(optimizeUploadedMedia(Buffer.from('not-an-image'), 'image/png')).rejects.toThrow(
      AppError,
    );

    expect(inferMimeFromFilename('berkas.PDF')).toBe('application/pdf');
    expect(inferMimeFromFilename('foto.webp')).toBe('image/webp');
  });

  it('FileService.upload routes PDF and WebP-optimized images into requested R2 folders', async () => {
    const putCommands: Array<{ key: string; contentType: string; byteLength: number }> = [];
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof PutObjectCommand) {
        putCommands.push({
          key: cmd.input.Key ?? '',
          contentType: cmd.input.ContentType ?? '',
          byteLength: Buffer.isBuffer(cmd.input.Body) ? cmd.input.Body.length : 0,
        });
      }
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    let seq = 0;
    stubPrismaModel(
      'file',
      {
        create: async ({ data }: any) => {
          seq += 1;
          return {
            id: `00000000-0000-0000-0000-00000000000${seq}`,
            originalName: data.originalName,
            fileName: data.fileName,
            mimeType: data.mimeType,
            extension: data.extension,
            size: data.size,
            storageProvider: data.storageProvider,
            publicId: data.publicId,
            url: data.url,
            uploadedById: data.uploadedById,
            createdAt: new Date(),
            deletedAt: null,
          };
        },
      },
      restorers,
    );

    const cvResult = await FileService.upload('user-1', {
      originalName: 'cv-budi.pdf',
      mimeType: 'application/pdf',
      size: 11,
      buffer: Buffer.from('%PDF-1.4 cv'),
      folder: 'cv',
    });
    expect(cvResult.url).toContain('/cv/');
    expect(cvResult.mimeType).toBe('application/pdf');

    const certResult = await FileService.upload('user-1', {
      originalName: 'certificate-001.pdf',
      mimeType: 'application/pdf',
      size: 13,
      buffer: Buffer.from('%PDF-1.4 cert'),
      folder: 'sertifikat',
    });
    expect(certResult.url).toContain('/sertifikat/');

    const pngBuf = await createSamplePngBuffer(1400, 700);
    const logoResult = await FileService.upload('user-1', {
      originalName: 'ugm-logo.png',
      mimeType: 'image/png',
      size: pngBuf.length,
      buffer: pngBuf,
      folder: 'univImage',
    });
    expect(logoResult.url).toContain('/univImage/');
    expect(logoResult.url?.endsWith('.webp')).toBe(true);
    expect(logoResult.mimeType).toBe('image/webp');
    expect(logoResult.extension).toBe('webp');

    expect(putCommands.map((c) => c.key.split('/')[0])).toEqual(['cv', 'sertifikat', 'univImage']);
    expect(putCommands[2].contentType).toBe('image/webp');
  });

  it('CertificateService.createPdfFile uploads certificates under sertifikat/', async () => {
    const putKeys: string[] = [];
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof PutObjectCommand) putKeys.push(cmd.input.Key ?? '');
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    stubPrismaModel(
      'file',
      {
        create: async ({ data }: any) => ({
          id: '00000000-0000-0000-0000-000000000099',
          ...data,
          createdAt: new Date(),
        }),
      },
      restorers,
    );

    const file = await (CertificateService as any).createPdfFile(
      'hr-1',
      'certificate-SIMAD-PST-2026-0001.pdf',
      Buffer.from('%PDF-1.4 cert'),
    );
    expect(file.url).toContain('/sertifikat/');
    expect(putKeys[0]?.startsWith('sertifikat/')).toBe(true);
  });

  it('UserService.uploadPhoto saves WebP into avatars/ and removes previous avatar file', async () => {
    const s3Events: string[] = [];
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof PutObjectCommand) s3Events.push(`put:${cmd.input.Key}`);
      if (cmd instanceof DeleteObjectCommand) s3Events.push(`del:${cmd.input.Key}`);
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    let findUserCalls = 0;
    stubPrismaModel(
      'user',
      {
        findUnique: async () => {
          findUserCalls += 1;
          if (findUserCalls === 1) {
            return {
              id: 'user-1',
              deletedAt: null,
              avatarFileId: 'old-avatar-id',
              avatarFile: null,
            };
          }
          return {
            id: 'user-1',
            fullName: 'Budi',
            email: 'budi@example.com',
            deletedAt: null,
            userRoles: [{ role: { code: 'INTERN' } }],
            internProfile: { phone: '08123456789' },
            avatarFile: { url: 'https://pub.r2.dev/avatars/new-avatar.webp' },
          };
        },
        update: async () => ({}),
      },
      restorers,
    );

    stubPrismaModel(
      'file',
      {
        create: async ({ data }: any) => ({
          id: 'new-avatar-id',
          ...data,
          createdAt: new Date(),
        }),
        findUnique: async () => ({
          id: 'old-avatar-id',
          uploadedById: 'user-1',
          deletedAt: null,
          storageProvider: 'r2',
          url: 'https://pub.r2.dev/avatars/old-avatar.webp',
        }),
        update: async () => ({}),
      },
      restorers,
    );

    const pngBuf = await createSamplePngBuffer(600, 600);
    const profile = await UserService.uploadPhoto(
      {
        id: 'user-1',
        email: 'budi@example.com',
        fullName: 'Budi',
        roles: ['INTERN'],
        emailVerified: true,
        isActive: true,
      },
      {
        originalName: 'profile.png',
        mimeType: 'image/png',
        size: pngBuf.length,
        buffer: pngBuf,
      },
    );

    expect(profile.profilePhoto).toBe('https://pub.r2.dev/avatars/new-avatar.webp');
    expect(s3Events[0]).toMatch(/^put:avatars\/.*\.webp$/);
    expect(s3Events[1]).toBe('del:avatars/old-avatar.webp');
  });

  it('FileService.removeIfUnreferenced deletes R2 object only when ref count is zero', async () => {
    const deletedKeys: string[] = [];
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof DeleteObjectCommand) deletedKeys.push(cmd.input.Key ?? '');
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    let updatedCount = 0;
    stubPrismaModel(
      'file',
      {
        findUnique: async ({ where }: any) => {
          if (where.id === 'file-referenced') {
            return {
              id: 'file-referenced',
              deletedAt: null,
              storageProvider: 'r2',
              url: 'https://pub.r2.dev/cv/referenced.pdf',
              _count: {
                certificateTemplates: 0,
                certificates: 0,
                applicationLetters: 1,
                avatarUsers: 0,
                applicationDocuments: 0,
                correctionEvidenceFiles: 0,
                certificateSignatures: 0,
                certificateStamps: 0,
                certificateSettingTemplates: 0,
              },
            };
          }
          return {
            id: 'file-orphan',
            deletedAt: null,
            storageProvider: 'r2',
            url: 'https://pub.r2.dev/cv/orphan.pdf',
            _count: {
              certificateTemplates: 0,
              certificates: 0,
              applicationLetters: 0,
              avatarUsers: 0,
              applicationDocuments: 0,
              correctionEvidenceFiles: 0,
              certificateSignatures: 0,
              certificateStamps: 0,
              certificateSettingTemplates: 0,
            },
          };
        },
        update: async () => {
          updatedCount += 1;
          return {};
        },
      },
      restorers,
    );

    await FileService.removeIfUnreferenced('file-referenced');
    expect(updatedCount).toBe(0);
    expect(deletedKeys).toEqual([]);

    await FileService.removeIfUnreferenced('file-orphan');
    expect(updatedCount).toBe(1);
    expect(deletedKeys).toEqual(['cv/orphan.pdf']);
  });

  it('ApplicationService.deleteDraft removes orphan files via FileService.removeIfUnreferenced', async () => {
    const removedIds: string[] = [];
    const removeSpy = spyOn(FileService, 'removeIfUnreferenced').mockImplementation(
      async (fileId: string) => {
        removedIds.push(fileId);
      },
    );
    restorers.push(() => removeSpy.mockRestore());

    stubPrismaModel(
      'internProfile',
      {
        findUnique: async () => ({ id: 'intern-prof-1', deletedAt: null }),
      },
      restorers,
    );
    stubPrismaModel(
      'internshipApplication',
      {
        findUnique: async () => ({
          id: 'app-1',
          internProfileId: 'intern-prof-1',
          status: 'DRAFT',
          introductionLetterFileId: 'letter-file-1',
        }),
        delete: async () => ({ id: 'app-1' }),
      },
      restorers,
    );
    stubPrismaModel(
      'applicationDocument',
      {
        findMany: async () => [{ fileId: 'cv-file-1' }, { fileId: 'letter-file-1' }],
      },
      restorers,
    );

    const res = await applicationService.deleteDraft('app-1', 'user-1');
    expect(res).toEqual({ message: 'Draft application deleted' });
    expect(removedIds).toEqual(['letter-file-1', 'cv-file-1']);
  });

  it('GET /api/v1/files/preview validates key prefixes and streams allowed R2 objects', async () => {
    const apiKey = process.env.INTERNAL_API_SECRET!;

    const missingRes = await app.handle(
      new Request('http://localhost/api/v1/files/preview', {
        headers: { 'x-internal-api-key': apiKey },
      }),
    );
    expect(missingRes.status).toBe(400);

    const blockedRes = await app.handle(
      new Request('http://localhost/api/v1/files/preview?key=private/secret.pdf', {
        headers: { 'x-internal-api-key': apiKey },
      }),
    );
    expect(blockedRes.status).toBe(403);

    const traversalRes = await app.handle(
      new Request('http://localhost/api/v1/files/preview?key=cv/../secret.pdf', {
        headers: { 'x-internal-api-key': apiKey },
      }),
    );
    expect(traversalRes.status).toBe(403);

    const sampleBytes = new TextEncoder().encode('%PDF-1.4 stream test');
    const sendSpy = spyOn(S3Client.prototype, 'send').mockImplementation(async (cmd: any) => {
      if (cmd instanceof GetObjectCommand) {
        return {
          ContentType: 'application/pdf',
          ContentLength: sampleBytes.length,
          Body: {
            transformToWebStream: () =>
              new ReadableStream({
                start(controller) {
                  controller.enqueue(sampleBytes);
                  controller.close();
                },
              }),
          },
        } as any;
      }
      return {} as any;
    });
    restorers.push(() => sendSpy.mockRestore());

    const inlineRes = await app.handle(
      new Request('http://localhost/api/v1/files/preview?key=cv/sample.pdf', {
        headers: { 'x-internal-api-key': apiKey },
      }),
    );
    expect(inlineRes.status).toBe(200);
    expect(inlineRes.headers.get('content-type')).toBe('application/pdf');
    expect(inlineRes.headers.get('content-disposition')).toBe('inline; filename="sample.pdf"');
    expect(await inlineRes.text()).toBe('%PDF-1.4 stream test');

    const downloadRes = await app.handle(
      new Request('http://localhost/api/v1/files/preview?key=cv/sample.pdf&download=true', {
        headers: { 'x-internal-api-key': apiKey },
      }),
    );
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers.get('content-disposition')).toBe(
      'attachment; filename="sample.pdf"',
    );
  });
});

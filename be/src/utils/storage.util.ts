import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '@/http/error';
import sharp from 'sharp';

/**
 * Utilitas validasi, optimasi media, dan penamaan file untuk penyimpanan backend.
 *
 * Batasan upload:
 * - Tipe: PDF, JPG, JPEG, PNG, WebP
 * - Maksimal 5 MB
 */

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const DEFAULT_WEBP_MAX_DIMENSION = 1024;
const TEMPLATE_WEBP_MAX_DIMENSION = 2048;
const WEBP_QUALITY = 80;

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

export function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

export function inferMimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Optimasi gambar ke format WebP (mempertahankan transparansi & orientasi EXIF).
 * File non-gambar (PDF) dikembalikan apa adanya.
 */
export async function optimizeUploadedMedia(
  buffer: Buffer,
  mimeType: string,
  maxDimension: number = DEFAULT_WEBP_MAX_DIMENSION,
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (mimeType === 'application/pdf') {
    return { buffer, mimeType };
  }

  try {
    const optimized = await sharp(buffer)
      .rotate()
      .resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return { buffer: optimized, mimeType: 'image/webp' };
  } catch {
    throw new AppError(422, 'File gambar tidak valid atau gagal diproses');
  }
}

export { TEMPLATE_WEBP_MAX_DIMENSION };

export function buildPublicId(originalName: string, mimeType: string): string {
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 60);
  return `${base}-${randomUUID()}.${getExtensionFromMime(mimeType)}`;
}

export async function ensureUploadDir(): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveUpload(buffer: Buffer, publicId: string): Promise<string> {
  await ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, publicId);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function readUpload(publicId: string): Promise<Buffer> {
  return readFile(path.join(UPLOAD_DIR, publicId));
}

export async function deleteUpload(publicId: string): Promise<void> {
  try {
    await unlink(path.join(UPLOAD_DIR, publicId));
  } catch {
    // File fisik sudah tidak ada — abaikan agar soft delete tetap sukses.
  }
}

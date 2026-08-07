import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Utilitas penyimpanan file lokal.
 * File disimpan ke direktori `be/storage/uploads` (bukan database),
 * sedangkan metadata disimpan di tabel `files` (storage_provider = 'local').
 *
 * Batasan upload (docs/07-api-specification.md §25.1):
 * - Tipe: PDF, JPG, JPEG, PNG
 * - Maksimal 5 MB
 */

export const ALLOWED_UPLOAD_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

export function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'bin';
  }
}

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

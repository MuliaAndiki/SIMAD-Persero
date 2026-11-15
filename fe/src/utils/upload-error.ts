import type { UploadR2Folder } from '@/types/api/file.types';

/**
 * Ekstrak pesan error yang jelas dan tidak ambigu dari exception upload
 * (jaringan, validasi file, maupun respons API backend).
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Terjadi kesalahan tidak terduga saat mengunggah berkas.',
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
  }
  return fallback;
}

/**
 * Membangun `FormData` standar untuk endpoint upload backend (`POST /files/upload`).
 * Mengisi fallback MIME dari ekstensi file bila browser mengosongkan `file.type`.
 */
export function createUploadFormData(file: File, folder: UploadR2Folder): FormData {
  let mimeType = file.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lowerName.endsWith('.png')) mimeType = 'image/png';
    else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
  }

  const normalizedFile =
    mimeType && mimeType !== file.type ? new File([file], file.name, { type: mimeType }) : file;

  const formData = new FormData();
  formData.append('file', normalizedFile);
  formData.append('folder', folder);
  return formData;
}

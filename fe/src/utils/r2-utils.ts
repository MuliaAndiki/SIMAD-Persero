'use server';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PDFDocument } from 'pdf-lib';

const bucketName = 'simad';
const avatarsPrefix = 'avatars';
const cvPrefix = 'cv';
const introductionLetterPrefix = 'surat-pengantar';
const univlogos = 'univImage';
const certificateTemplatesPrefix = 'certificate-templates';
const signaturesPrefix = 'signatures';

// ponytail: fixed resize/quality, raise only if avatar/logo looks soft
const WEBP_MAX_DIMENSION = 1024;
const WEBP_QUALITY = 80;

export type R2UploadActionResult =
  | { ok: true; url: string }
  | { ok: false; code: 'INVALID_FILE' | 'CONFIG_MISSING' | 'R2_ERROR'; error: string };

class R2ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'R2ConfigError';
  }
}

function resolveR2Config() {
  return {
    accountId: process.env.NEXT_CLOUDFLARE_ACCOUNT_ID?.trim() || '',
    accessKeyId: process.env.NEXT_ACCESS_KEY_ID?.trim() || '',
    secretAccessKey: process.env.NEXT_SECRET_ACCESS_KEY?.trim() || '',
    publicUrl: (process.env.NEXT_PUBLIC_R2_URL || '').trim().replace(/\/+$/, ''),
  };
}

function createR2Client(accountId: string, accessKeyId: string, secretAccessKey: string) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId || 'missing'}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const initialR2Config = resolveR2Config();
const R2 = createR2Client(
  initialR2Config.accountId,
  initialR2Config.accessKeyId,
  initialR2Config.secretAccessKey,
);

function getR2Client() {
  const { accountId, accessKeyId, secretAccessKey, publicUrl } = resolveR2Config();
  const missing: string[] = [];
  if (!accountId) missing.push('NEXT_CLOUDFLARE_ACCOUNT_ID');
  if (!accessKeyId) missing.push('NEXT_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('NEXT_SECRET_ACCESS_KEY');

  if (missing.length > 0) {
    throw new R2ConfigError(
      `Konfigurasi Cloudflare R2 belum lengkap di server frontend (${missing.join(', ')})`,
    );
  }

  return {
    client: createR2Client(accountId, accessKeyId, secretAccessKey),
    accountId,
    publicUrl,
  };
}

function formatR2Error(error: unknown): string {
  if (error instanceof Error) {
    const errAny = error as Error & {
      Code?: string;
      $metadata?: { httpStatusCode?: number };
      cause?: { code?: string };
    };
    const code = errAny.Code || (errAny.name && errAny.name !== 'Error' ? errAny.name : '');
    const status = errAny.$metadata?.httpStatusCode;
    const causeCode = errAny.cause?.code;
    const tags = [status ? `HTTP ${status}` : '', code, causeCode].filter(Boolean);
    const prefix = tags.length > 0 ? `[${tags.join(' / ')}] ` : '';
    return `${prefix}${errAny.message || 'Gagal menghubungi Cloudflare R2'}`;
  }
  return 'Kesalahan tidak dikenal saat mengunggah ke Cloudflare R2';
}

async function putToR2(Key: string, Body: Buffer, ContentType: string): Promise<string> {
  const { client, accountId, publicUrl } = getR2Client();
  await client.send(new PutObjectCommand({ Bucket: bucketName, Key, Body, ContentType }));
  if (publicUrl) return `${publicUrl}/${Key}`;
  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${Key}`;
}

function buildKey(folder: string, ext: string): string {
  const folderPath = folder.endsWith('/') ? folder : `${folder}/`;
  const rand = Math.random().toString(36).substring(2, 15);
  return `${folderPath}${Date.now()}-${rand}.${ext}`;
}

async function prepareUpload(file: File, convertPhoto: boolean) {
  const raw = Buffer.from(await file.arrayBuffer());
  if (convertPhoto) {
    const webp = await toWebpBuffer(raw, file.type);
    if (webp) return { body: webp, ext: 'webp', contentType: 'image/webp' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const inferredType =
    file.type || (ext === 'pdf' ? 'application/pdf' : 'application/octet-stream');
  return {
    body: raw,
    ext,
    contentType: inferredType,
  };
}

async function uploadDoc(file: File, folder: string): Promise<string> {
  const { body, ext, contentType } = await prepareUpload(file, false);
  // ponytail: repack object-stream saja (5-20%), tanpa downsampling isi — gagal → file asli
  if (contentType === 'application/pdf') {
    const small = await compressPdfBuffer(body);
    if (small) return putToR2(buildKey(folder, 'pdf'), small, contentType);
  }
  return putToR2(buildKey(folder, ext), body, contentType);
}

/**
 * Server Action terstruktur untuk upload dokumen pengajuan magang ke R2.
 * Mengembalikan hasil error secara eksplisit agar Next.js production tidak menyensor pesan error.
 */
export async function uploadApplicationDocumentAction(
  formData: FormData,
): Promise<R2UploadActionResult> {
  const entry = formData.get('file');
  const kind = formData.get('kind') === 'cv' ? 'cv' : 'pengantar';

  if (!(entry instanceof File) || entry.size <= 0) {
    return {
      ok: false,
      code: 'INVALID_FILE',
      error: 'File tidak ditemukan atau berukuran 0 byte.',
    };
  }

  const folder = kind === 'cv' ? cvPrefix : introductionLetterPrefix;
  try {
    const url = await uploadDoc(entry, folder);
    return { ok: true, url };
  } catch (error) {
    if (error instanceof R2ConfigError) {
      return { ok: false, code: 'CONFIG_MISSING', error: error.message };
    }
    return { ok: false, code: 'R2_ERROR', error: formatR2Error(error) };
  }
}

async function uploadPhoto(file: File, folder: string): Promise<string> {
  const { body, ext, contentType } = await prepareUpload(file, true);
  return putToR2(buildKey(folder, ext), body, contentType);
}

export async function uploadAvatar(file: File, folder: string = avatarsPrefix): Promise<string> {
  return uploadPhoto(file, folder);
}

export async function uploadCv(file: File, folder: string = cvPrefix): Promise<string> {
  return uploadDoc(file, folder);
}

export async function uploadIntroductionLetter(
  file: File,
  folder: string = introductionLetterPrefix,
): Promise<string> {
  return uploadDoc(file, folder);
}

/** @deprecated pakai uploadIntroductionLetter — alias agar caller lama tidak patah */
export async function uploadFileUniv(
  file: File,
  folder: string = introductionLetterPrefix,
): Promise<string> {
  return uploadDoc(file, folder);
}

export async function uploadUnivLogo(file: File, folder: string = univlogos): Promise<string> {
  return uploadPhoto(file, folder);
}

export async function uploadCertificateTemplate(
  file: File,
  folder: string = certificateTemplatesPrefix,
): Promise<string> {
  // template bisa PDF/image — convert hanya jika image
  const { body, ext, contentType } = await prepareUpload(file, true);
  return putToR2(buildKey(folder, ext), body, contentType);
}

export async function uploadSignature(
  file: File,
  folder: string = signaturesPrefix,
): Promise<string> {
  return uploadPhoto(file, folder);
}

export async function deleteObject(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl);

    let Key = url.pathname.substring(1);

    if (Key.startsWith(`${bucketName}/`)) {
      Key = Key.substring(`${bucketName}/`.length);
    }

    const deleteParams = {
      Bucket: bucketName,
      Key,
    };

    await R2.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
    throw new Error('Gagal menghapus file');
  }
}

async function compressPdfBuffer(input: Buffer): Promise<Buffer | null> {
  try {
    const doc = await PDFDocument.load(input, { ignoreEncryption: true });
    const out = Buffer.from(await doc.save({ useObjectStreams: true }));
    return out.length < input.length ? out : null;
  } catch {
    return null;
  }
}

async function toWebpBuffer(input: Buffer, mimeType: string): Promise<Buffer | null> {
  if (mimeType === 'image/webp' || mimeType === 'image/svg+xml') return null;
  if (mimeType && !mimeType.startsWith('image/')) return null;
  try {
    const { default: sharp } = await import('sharp');
    return await sharp(input, { animated: false })
      .rotate()
      .resize({
        width: WEBP_MAX_DIMENSION,
        height: WEBP_MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return null;
  }
}

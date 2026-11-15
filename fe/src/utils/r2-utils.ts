'use server';

import { env } from '@/configs';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const accountId = process.env.NEXT_CLOUDFLARE_ACCOUNT_ID;
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

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL || '';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.NEXT_ACCESS_KEY_ID,
    secretAccessKey: env.NEXT_SECRET_ACCESS_KEY,
  },
});

async function putToR2(Key: string, Body: Buffer, ContentType: string): Promise<string> {
  await R2.send(new PutObjectCommand({ Bucket: bucketName, Key, Body, ContentType }));
  if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${Key}`;
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
  return {
    body: raw,
    ext: file.name.split('.').pop() || 'bin',
    contentType: file.type || 'application/octet-stream',
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

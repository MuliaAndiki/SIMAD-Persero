import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '@/config/env.config';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const bucketName = 'simad';
const sertifikatPrefix = 'sertifikat';
const avatarsPrefix = 'avatars';
const fileUnivPrefix = 'fileuniv';

const R2_PUBLIC_URL = (env.PUBLIC_R2_URL ?? '').replace(/\/$/, '');

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a buffer to Cloudflare R2.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  await R2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const base = R2_PUBLIC_URL || `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`;
  return `${base}/${key}`;
}

/**
 * Delete a file from Cloudflare R2 by its public URL.
 */
export async function deleteFromR2(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl);
    let key = url.pathname.substring(1);

    // Strip bucket name prefix if it appears in the path (direct endpoint URL).
    if (key.startsWith(`${bucketName}/`)) {
      key = key.substring(`${bucketName}/`.length);
    }

    await R2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
    throw new Error('Gagal menghapus file dari R2');
  }
}

// ── Convenience wrappers per folder ──────────────────────────────────────────

/** Upload certificate PDF; returns public URL. */
export async function uploadCertifikat(buffer: Buffer, fileName: string): Promise<string> {
  const key = `${sertifikatPrefix}/${fileName}`;
  return uploadToR2(buffer, key, 'application/pdf');
}

/** Upload university/general file (PDF / image); returns public URL. */
export async function uploadFile(
  buffer: Buffer,
  publicId: string,
  contentType: string,
): Promise<string> {
  const folder = contentType === 'application/pdf' ? fileUnivPrefix : avatarsPrefix;
  const key = `${folder}/${publicId}`;
  return uploadToR2(buffer, key, contentType);
}

/** Upload user avatar image; returns public URL. */
export async function uploadAvatarToR2(
  buffer: Buffer,
  publicId: string,
  contentType: string,
): Promise<string> {
  const key = `${avatarsPrefix}/${publicId}`;
  return uploadToR2(buffer, key, contentType);
}

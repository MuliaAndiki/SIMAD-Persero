'use server';

import { env } from '@/configs';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.NEXT_CLOUDFLARE_ACCOUNT_ID;
const bucketName = 'simad';
const avatarsPrefix = 'avatars';
const fileUnivPrefix = 'fileuniv';
const univlogos = 'univImage'

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL || '';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.NEXT_ACCESS_KEY_ID,
    secretAccessKey: env.NEXT_SECRET_ACCESS_KEY,
  },
});

export async function uploadAvatar(file: File, folder: string = avatarsPrefix): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const folderPath = folder.endsWith('/') ? folder : `${folder}/`;
  const Key = `${folderPath}${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadParams = {
    Bucket: bucketName,
    Key,
    Body: buffer,
    ContentType: file.type,
  };

  await R2.send(new PutObjectCommand(uploadParams));

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${Key}`;
  }

  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${Key}`;
}

export async function uploadFileUniv(
  file: File,
  folder: string = fileUnivPrefix,
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const folderPath = folder.endsWith('/') ? folder : `${folder}/`;
  const Key = `${folderPath}${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadParams = {
    Bucket: bucketName,
    Key,
    Body: buffer,
    ContentType: file.type,
  };

  await R2.send(new PutObjectCommand(uploadParams));

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${Key}`;
  }

  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${Key}`;
}

export async function uploadUnivLogo(
  file: File,
  folder: string = univlogos,
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const folderPath = folder.endsWith('/') ? folder : `${folder}/`;
  const Key = `${folderPath}${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadParams = {
    Bucket: bucketName,
    Key,
    Body: buffer,
    ContentType: file.type,
  };

  await R2.send(new PutObjectCommand(uploadParams));

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${Key}`;
  }

  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${Key}`;
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

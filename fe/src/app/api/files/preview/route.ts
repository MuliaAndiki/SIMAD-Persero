import { env } from '@/configs';
import { extractR2Key } from '@/utils/file-preview';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { type NextRequest, NextResponse } from 'next/server';

const accountId = process.env.NEXT_CLOUDFLARE_ACCOUNT_ID;
const bucketName = 'simad';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.NEXT_ACCESS_KEY_ID,
    secretAccessKey: env.NEXT_SECRET_ACCESS_KEY,
  },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const keyParam = searchParams.get('key');
    const urlParam = searchParams.get('url');
    const fileIdParam = searchParams.get('fileId');
    const downloadParam = searchParams.get('download');

    let key = '';
    if (keyParam) {
      key = keyParam.replace(/^\/+/, '');
    } else if (urlParam) {
      key = extractR2Key(urlParam);
    } else if (fileIdParam) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/v1/files/${fileIdParam}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const fileUrl = json?.data?.url || json?.data?.fileName;
        if (fileUrl) {
          key = extractR2Key(fileUrl);
        }
      }
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Parameter key, url, atau fileId diperlukan' },
        { status: 400 },
      );
    }

    if (key.startsWith(`${bucketName}/`)) {
      key = key.substring(`${bucketName}/`.length);
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const s3Response = await R2.send(command);
    if (!s3Response.Body) {
      return NextResponse.json({ error: 'Konten file kosong' }, { status: 404 });
    }

    const contentType = s3Response.ContentType || 'application/pdf';
    const isDownload = downloadParam === 'true';
    const filename = key.split('/').pop() || 'document.pdf';
    const disposition = isDownload
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', disposition);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    headers.set('Accept-Ranges', 'bytes');
    if (s3Response.ContentLength) {
      headers.set('Content-Length', String(s3Response.ContentLength));
    }

    const webStream = s3Response.Body.transformToWebStream();
    return new Response(webStream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error streaming file from R2 in proxy:', error);
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'File tidak ditemukan di penyimpanan' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Gagal memuat file dari penyimpanan' }, { status: 500 });
  }
}

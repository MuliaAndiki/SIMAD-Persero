import { baseurl } from '@/configs/repo.config';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const key = searchParams.get('key');
    const url = searchParams.get('url');
    const fileId = searchParams.get('fileId');
    const download = searchParams.get('download');

    if (!key && !url && !fileId) {
      return NextResponse.json(
        { error: 'Parameter key, url, atau fileId diperlukan' },
        { status: 400 },
      );
    }

    const upstreamParams = new URLSearchParams();
    if (key) upstreamParams.set('key', key);
    if (url) upstreamParams.set('url', url);
    if (fileId) upstreamParams.set('fileId', fileId);
    if (download) upstreamParams.set('download', download);

    const internalApiKey =
      process.env.NEXT_INTERNAL_API_SECRET ||
      process.env.INTERNAL_API_SECRET ||
      process.env.INTERNAL_API_KEY ||
      '';

    const upstreamUrl = `${baseurl.replace(/\/$/, '')}/files/preview?${upstreamParams.toString()}`;
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'x-internal-api-key': internalApiKey,
      },
      cache: 'no-store',
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      const fallbackError =
        upstreamRes.status === 404
          ? 'File tidak ditemukan di penyimpanan'
          : 'Gagal memuat file dari backend';
      try {
        const errJson = (await upstreamRes.json()) as { message?: string; error?: string };
        return NextResponse.json(
          { error: errJson?.message || errJson?.error || fallbackError },
          { status: upstreamRes.status || 502 },
        );
      } catch {
        return NextResponse.json({ error: fallbackError }, { status: upstreamRes.status || 502 });
      }
    }

    const headers = new Headers();
    const forwardedHeaders = [
      'content-type',
      'content-disposition',
      'content-length',
      'cache-control',
      'accept-ranges',
    ];
    for (const headerName of forwardedHeaders) {
      const value = upstreamRes.headers.get(headerName);
      if (value) headers.set(headerName, value);
    }

    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying file preview to backend:', error);
    return NextResponse.json({ error: 'Gagal menghubungi layanan file backend' }, { status: 502 });
  }
}

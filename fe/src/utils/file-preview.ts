/**
 * Utility untuk ekstraksi key R2 dan pembuatan URL preview file
 * yang aman dan kompatibel di lingkungan localhost maupun production.
 */

/**
 * Mengekstrak object key S3/R2 dari berbagai format URL atau path.
 *
 * Contoh input:
 * - "https://pub-2f811af54c344a96ad45cb28d7493156.r2.dev/fileuniv/123-abc.pdf" -> "fileuniv/123-abc.pdf"
 * - "https://23ad70705473f1205500a8ceb2f70f92.r2.cloudflarestorage.com/simad/fileuniv/123-abc.pdf" -> "fileuniv/123-abc.pdf"
 * - "/fileuniv/123-abc.pdf" -> "fileuniv/123-abc.pdf"
 * - "fileuniv/123-abc.pdf" -> "fileuniv/123-abc.pdf"
 */
export function extractR2Key(fileUrlOrKey: string): string {
  if (!fileUrlOrKey) return '';
  try {
    if (!fileUrlOrKey.startsWith('http://') && !fileUrlOrKey.startsWith('https://')) {
      return fileUrlOrKey.replace(/^\/+/, '');
    }
    const parsed = new URL(fileUrlOrKey);
    let key = parsed.pathname.replace(/^\/+/, '');
    if (key.startsWith('simad/')) {
      key = key.substring('simad/'.length);
    }
    return decodeURIComponent(key);
  } catch {
    return fileUrlOrKey.replace(/^\/+/, '');
  }
}

/**
 * Menghasilkan URL preview file melalui internal proxy route `/api/files/preview`.
 *
 * Keuntungan menggunakan internal proxy:
 * 1. Tidak terkena blokir ISP / ICON+ BigIP (Internet Sehat) pada domain `*.r2.dev`.
 * 2. Same-origin: Bebas hambatan CORS dan dapat di-embed langsung pada `<iframe>` di localhost maupun prod.
 * 3. Menghindari kegagalan otentikasi AWS Signature pada URL `*.r2.cloudflarestorage.com`.
 */
export function getFilePreviewUrl(
  file?: { id?: string; url?: string | null } | string | null,
): string {
  if (!file) return '';
  const fileUrl = typeof file === 'string' ? file : file.url;
  if (fileUrl) {
    const key = extractR2Key(fileUrl);
    if (key) {
      return `/api/files/preview?key=${encodeURIComponent(key)}`;
    }
    return `/api/files/preview?url=${encodeURIComponent(fileUrl)}`;
  }
  if (typeof file === 'object' && file?.id) {
    return `/api/files/preview?fileId=${file.id}`;
  }
  return '';
}

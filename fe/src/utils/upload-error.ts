/**
 * Ekstrak pesan error yang jelas dan tidak ambigu dari exception upload
 * (baik dari Next.js Server Action, jaringan, maupun respons API backend).
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Terjadi kesalahan tidak terduga.',
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
 * Menerjemahkan error transport/Server Action Next.js di production agar pesan
 * tidak berhenti di pesan generik, tetap menyertakan penyebab utamanya.
 */
export function describeServerActionUploadError(error: unknown): string {
  const raw = getErrorMessage(error, 'Server Action upload gagal dijalankan.');
  const lower = raw.toLowerCase();

  if (
    lower.includes('413') ||
    lower.includes('body exceeded') ||
    lower.includes('payload too large') ||
    lower.includes('content too large') ||
    lower.includes('function_payload_too_large')
  ) {
    return `Ukuran request melebihi batas payload server Vercel (~4.5 MB): ${raw}`;
  }

  if (lower.includes('server components render') || lower.includes('omitted in production')) {
    return `Server Action melempar error di environment production (detail disensor oleh Next.js): ${raw}`;
  }

  if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return `Koneksi ke server gagal terhubung: ${raw}`;
  }

  return raw;
}

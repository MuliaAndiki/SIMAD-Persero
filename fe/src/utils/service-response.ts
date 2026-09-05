import type { ApiResponse, TResponse } from '@/api/types/response.types';

/**
 * Memetakan envelope mentah backend ({ status, title, message, data, meta })
 * menjadi `TResponse` standar frontend
 * ({ statusCode, status, title, message, data, meta, errors }).
 *
 * `status: 'success' | 'error'` dipakai `WrapApi` (fe/src/utils/wrapApi.ts)
 * untuk melempar Error ketika respons backend bukan sukses.
 */

interface ToServiceResponseOptions {
  title?: string;
  message: string;
  statusCode?: number;
}

export function toServiceResponse<T>(
  res: ApiResponse<T>,
  options: ToServiceResponseOptions,
): TResponse<T> {
  const isSuccess = res.status >= 200 && res.status < 300;

  // Extract title from response or use options
  let title = '';
  if (typeof res?.title === 'string' && res.title.trim() !== '') {
    title = res.title;
  } else if (isSuccess) {
    title = options.title ?? '';
  } else {
    title = 'Terjadi Kesalahan';
  }

  // Extract message from response or use options
  let message = '';
  if (typeof res?.message === 'string' && res.message.trim() !== '') {
    message = res.message;
  } else if (!isSuccess && typeof (res as any)?.error === 'string' && (res as any).error.trim() !== '') {
    message = (res as any).error;
  } else if (!isSuccess && typeof (res as any)?.summary === 'string' && (res as any).summary.trim() !== '') {
    message = (res as any).summary;
  } else if (isSuccess) {
    message = options.message;
  } else {
    message = 'Terjadi kesalahan saat memproses permintaan.';
  }

  return {
    statusCode: res.status > 0 ? res.status : (options.statusCode ?? 200),
    status: isSuccess ? 'success' : 'error',
    title,
    message,
    data: res.data ?? null,
    meta: res.meta ?? null,
    errors: null,
  };
}

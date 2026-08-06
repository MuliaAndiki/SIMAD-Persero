import type { ApiResponse, TResponse } from '@/api/types/response.types';

/**
 * Memetakan envelope mentah backend ({ status, message, data, meta })
 * menjadi `TResponse` standar frontend
 * ({ statusCode, status, message, data, meta, errors }).
 *
 * `status: 'success' | 'error'` dipakai `WrapApi` (fe/src/utils/wrapApi.ts)
 * untuk melempar Error ketika respons backend bukan sukses.
 */

interface ToServiceResponseOptions {
  message: string;
  statusCode?: number;
}

export function toServiceResponse<T>(
  res: ApiResponse<T>,
  options: ToServiceResponseOptions,
): TResponse<T> {
  const isSuccess = res.status >= 200 && res.status < 300;

  return {
    statusCode: res.status > 0 ? res.status : (options.statusCode ?? 200),
    status: isSuccess ? 'success' : 'error',
    message: res.message || options.message,
    data: res.data ?? null,
    meta: res.meta ?? null,
    errors: null,
  };
}

import type { ErrorCode } from './error-codes';

/**
 * Error khusus aplikasi yang membawa status HTTP.
 * Dipakai oleh service layer untuk menandakan kegagalan bisnis
 * beserta status kode yang seharusnya dikembalikan ke klien.
 * Controller memetakan `AppError` ini ke helper `HttpResponse` dari `@/http`.
 */
export class AppError extends Error {
  public readonly status: number;

  /** Kode error katalog (API spec §32) — opsional, diisi bila relevan. */
  public readonly code?: ErrorCode;

  constructor(status: number, message: string, code?: ErrorCode) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

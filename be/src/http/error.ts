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

export class BadRequestError extends AppError {
  constructor(message: string, code?: ErrorCode) {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: ErrorCode) {
    super(401, message, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: ErrorCode) {
    super(403, message, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', code?: ErrorCode) {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

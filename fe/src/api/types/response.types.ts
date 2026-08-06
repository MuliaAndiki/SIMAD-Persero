/**
 * Tipe respons standar API frontend.
 *
 * `ApiResponse<T>` adalah bentuk mentah (raw) yang dikembalikan backend
 * (envelope: status, message, data, meta — lihat be/src/http/index.ts).
 * `ApiSuccessResponse<T>` adalah bentuk yang dikembalikan lapisan fetch
 * (fe/src/api/client & fe/src/api/server) — `ApiResponse<T>` plus flag
 * `success` untuk memudahkan pengecekan hasil.
 * `TResponse<T>` adalah bentuk final hasil `toServiceResponse` yang
 * dikonsumsi oleh service, komponen UI, dan react-query.
 */

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  error?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]> | null;
}

/** Error terstruktur dari lapisan fetch (dipakai variant raw-data). */
export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]> | null;

  constructor(message: string, status: number, errors?: Record<string, string[]> | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export type ApiStatus = 'success' | 'error';

export interface TResponse<T = unknown> {
  statusCode: number;
  status: ApiStatus;
  message: string;
  data: T | null;
  meta: Record<string, unknown> | null;
  errors: { field: string; message: string }[] | null;
}

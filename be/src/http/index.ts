import type { AppContext } from '@/contex';
import { getLogger } from '../telemetry/otel.config';
import { AppError } from './error';
import type { ErrorCode } from './error-codes';

type RequestTimingStore = {
  startedAt?: number;
};

function isGetRequest(c: AppContext) {
  return c.request.method.toUpperCase() === 'GET';
}

function formatProcessTime(c: AppContext) {
  const store = c.store as RequestTimingStore | undefined;
  if (!store?.startedAt) {
    return '0ms';
  }

  const durationMs = Math.max(0, Math.round(performance.now() - store.startedAt));

  return `${durationMs}ms`;
}

function buildGetResponseMeta(c: AppContext, meta?: unknown) {
  const process_time = formatProcessTime(c);

  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    return {
      ...(meta as Record<string, unknown>),
      process_time,
    };
  }

  return { process_time };
}

function errorResponse(c: AppContext, status: number, message: string, title?: string, code?: ErrorCode) {
  return c.json?.({ status, title: title || getDefaultErrorTitle(status), message, ...(code ? { code } : {}) }, status);
}

function getDefaultErrorTitle(status: number): string {
  switch (status) {
    case 400: return 'Permintaan Tidak Valid';
    case 401: return 'Tidak Berizin';
    case 403: return 'Akses Ditolak';
    case 404: return 'Tidak Ditemukan';
    case 409: return 'Terjadi Konflik';
    case 422: return 'Data Tidak Valid';
    case 429: return 'Terlalu Banyak Permintaan';
    case 500: return 'Kesalahan Server';
    case 502: return 'Gateway Bermasalah';
    case 503: return 'Layanan Tidak Tersedia';
    default: return 'Terjadi Kesalahan';
  }
}

export function HttpResponse(c: AppContext) {
  return {
    ok: (data?: any, meta?: any, message = 'Berhasil', title = 'Berhasil') => {
      const responseMeta = isGetRequest(c) ? buildGetResponseMeta(c, meta) : meta;

      return c.json?.({ status: 200, title, message, data, meta: responseMeta }, 200);
    },
    created: (data?: any, message = 'Data berhasil dibuat', title = 'Berhasil Dibuat') =>
      c.json?.({ status: 201, title, message, data }, 201),
    accepted: (data?: any, message = 'Permintaan Anda sedang diproses', title = 'Permintaan Diterima') =>
      c.json?.({ status: 202, title, message, data }, 202),
    noContent: (message = 'Tidak ada konten', title = 'Tidak Ada Konten') => 
      c.json?.({ status: 204, title, message }, 204),
    badRequest: (message = 'Permintaan tidak valid', code?: ErrorCode, title?: string) =>
      errorResponse(c, 400, message, title, code),
    unauthorized: (message = 'Tidak berizin', code?: ErrorCode, title?: string) =>
      errorResponse(c, 401, message, title, code),
    forbidden: (message = 'Akses ditolak', code?: ErrorCode, title?: string) =>
      errorResponse(c, 403, message, title, code),
    notFound: (message = 'Tidak ditemukan', code?: ErrorCode, title?: string) =>
      errorResponse(c, 404, message, title, code),
    conflict: (message = 'Terjadi konflik', code?: ErrorCode, title?: string) =>
      errorResponse(c, 409, message, title, code),
    unprocessable: (message = 'Entitas tidak dapat diproses', code?: ErrorCode, title?: string) =>
      errorResponse(c, 422, message, title, code),
    tooManyRequests: (
      message = 'Terlalu banyak permintaan',
      code?: ErrorCode,
      retryAfterSeconds?: number,
      title?: string,
    ) => {
      if (retryAfterSeconds !== undefined) {
        c.set.headers['Retry-After'] = String(retryAfterSeconds);
      }
      return errorResponse(c, 429, message, title, code);
    },
    internalError: (error?: unknown, customMessage?: string, customTitle?: string) => {
      const { message: friendlyMessage, status } = getFriendlyErrorMessage(error);
      const finalMessage = customMessage || friendlyMessage || 'Terjadi kesalahan pada server';
      const finalTitle = customTitle || getDefaultErrorTitle(status);
      return c.json?.(
        {
          status,
          title: finalTitle,
          message: finalMessage,
        },
        status,
      );
    },
    notImplemented: (message = 'Fitur belum diimplementasikan', title = 'Belum Tersedia') =>
      c.json?.({ status: 501, title, message }, 501),
    badGateway: (message = 'Gateway bermasalah', title = 'Gateway Bermasalah') => 
      c.json?.({ status: 502, title, message }, 502),
    serviceUnavailable: (message = 'Layanan tidak tersedia', title = 'Layanan Tidak Tersedia') =>
      c.json?.({ status: 503, title, message }, 503),
  };
}

export function getFriendlyErrorMessage(error: unknown): { message: string; status: number } {
  if (!error) {
    return { message: 'Terjadi kesalahan pada server', status: 500 };
  }

  const errObj = error as any;
  const code = errObj?.code || errObj?.name;

  // Handle Database & Prisma Known Request Errors
  if (
    code === 'P2024' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1003' ||
    code === 'P1008' ||
    code === 'P1017'
  ) {
    return {
      message: 'Gagal terhubung ke database. Silakan coba beberapa saat lagi.',
      status: 503,
    };
  }

  if (code === 'P2002') {
    return {
      message: 'Data yang Anda masukkan sudah terdaftar (duplikat).',
      status: 409,
    };
  }

  if (code === 'P2025') {
    return {
      message: 'Data yang dicari tidak ditemukan.',
      status: 404,
    };
  }

  if (code === 'P2003' || code === 'P2014') {
    return {
      message: 'Data tidak dapat diproses karena terikat dengan data lain.',
      status: 400,
    };
  }

  if (code === 'P2023') {
    return {
      message: 'Format ID atau kolom data tidak valid.',
      status: 400,
    };
  }

  if (errObj instanceof AppError) {
    return { message: errObj.message, status: errObj.status };
  }

  if (typeof errObj.message === 'string' && errObj.message.trim() !== '') {
    if (errObj.message.includes('Invalid `prisma.') || errObj.message.includes('PrismaClient')) {
      return { message: 'Terjadi kesalahan pada pemrosesan database', status: 500 };
    }
    return { message: errObj.message, status: errObj.status || 500 };
  }

  return { message: 'Terjadi kesalahan pada server', status: 500 };
}

/**
 * Pemetaan AppError & PrismaError ke response HTTP standar.
 * Controller cukup memanggil `return handleAppError(c, error)` di catch block.
 */
export function handleAppError(c: AppContext, error: unknown) {
  if (error instanceof AppError) {
    const { status, message, code } = error;

    if (status >= 500) {
      getLogger().error({ err: error, code }, `[AppError] ${status} - ${message}`);
    } else {
      getLogger().warn({ code }, `[AppWarn] ${status} - ${message}`);
    }

    const title = getDefaultErrorTitle(status);

    switch (status) {
      case 400:
        return HttpResponse(c).badRequest(message, code, title);
      case 401:
        return HttpResponse(c).unauthorized(message, code, title);
      case 403:
        return HttpResponse(c).forbidden(message, code, title);
      case 404:
        return HttpResponse(c).notFound(message, code, title);
      case 409:
        return HttpResponse(c).conflict(message, code, title);
      case 410:
        return HttpResponse(c).notFound(message, code, title);
      case 422:
        return HttpResponse(c).unprocessable(message, code, title);
      case 429:
        return HttpResponse(c).tooManyRequests(message, code, undefined, title);
      default:
        return HttpResponse(c).internalError(error);
    }
  }

  getLogger().error({ err: error }, '[Unhandled Server Error]');

  return HttpResponse(c).internalError(error);
}

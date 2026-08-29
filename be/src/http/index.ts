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

function errorResponse(c: AppContext, status: number, message: string, code?: ErrorCode) {
  return c.json?.({ status, message, ...(code ? { code } : {}) }, status);
}

export function HttpResponse(c: AppContext) {
  return {
    ok: (data?: any, meta?: any, message = 'Berhasil') => {
      const responseMeta = isGetRequest(c) ? buildGetResponseMeta(c, meta) : meta;

      return c.json?.({ status: 200, message, data, meta: responseMeta }, 200);
    },
    created: (data?: any, message = 'Berhasil dibuat') =>
      c.json?.({ status: 201, message, data }, 201),
    accepted: (data?: any, message = 'Permintaan diterima') =>
      c.json?.({ status: 202, message, data }, 202),
    noContent: (message = 'Tidak ada konten') => c.json?.({ status: 204, message }, 204),
    badRequest: (message = 'Permintaan tidak valid', code?: ErrorCode) =>
      errorResponse(c, 400, message, code),
    unauthorized: (message = 'Tidak berizin', code?: ErrorCode) =>
      errorResponse(c, 401, message, code),
    forbidden: (message = 'Akses ditolak', code?: ErrorCode) =>
      errorResponse(c, 403, message, code),
    notFound: (message = 'Tidak ditemukan', code?: ErrorCode) =>
      errorResponse(c, 404, message, code),
    conflict: (message = 'Terjadi konflik', code?: ErrorCode) =>
      errorResponse(c, 409, message, code),
    unprocessable: (message = 'Entitas tidak dapat diproses', code?: ErrorCode) =>
      errorResponse(c, 422, message, code),
    tooManyRequests: (
      message = 'Terlalu banyak permintaan',
      code?: ErrorCode,
      retryAfterSeconds?: number,
    ) => {
      if (retryAfterSeconds !== undefined) {
        c.set.headers['Retry-After'] = String(retryAfterSeconds);
      }
      return errorResponse(c, 429, message, code);
    },
    internalError: (error?: unknown, customMessage?: string) => {
      const { message: friendlyMessage, status } = getFriendlyErrorMessage(error);
      const finalMessage = customMessage || friendlyMessage || 'Terjadi kesalahan pada server';
      return c.json?.(
        {
          status,
          message: finalMessage,
        },
        status,
      );
    },
    notImplemented: (message = 'Fitur belum diimplementasikan') =>
      c.json?.({ status: 501, message }, 501),
    badGateway: (message = 'Gateway bermasalah') => c.json?.({ status: 502, message }, 502),
    serviceUnavailable: (message = 'Layanan tidak tersedia') =>
      c.json?.({ status: 503, message }, 503),
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

    switch (status) {
      case 400:
        return HttpResponse(c).badRequest(message, code);
      case 401:
        return HttpResponse(c).unauthorized(message, code);
      case 403:
        return HttpResponse(c).forbidden(message, code);
      case 404:
        return HttpResponse(c).notFound(message, code);
      case 409:
        return HttpResponse(c).conflict(message, code);
      case 410:
        return HttpResponse(c).notFound(message, code);
      case 422:
        return HttpResponse(c).unprocessable(message, code);
      case 429:
        return HttpResponse(c).tooManyRequests(message, code);
      default:
        return HttpResponse(c).internalError(error);
    }
  }

  getLogger().error({ err: error }, '[Unhandled Server Error]');

  return HttpResponse(c).internalError(error);
}

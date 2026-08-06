import type { AppContext } from '@/contex';

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
    badRequest: (message = 'Permintaan tidak valid') => c.json?.({ status: 400, message }, 400),
    unauthorized: (message = 'Tidak berizin') => c.json?.({ status: 401, message }, 401),
    forbidden: (message = 'Akses ditolak') => c.json?.({ status: 403, message }, 403),
    notFound: (message = 'Tidak ditemukan') => c.json?.({ status: 404, message }, 404),
    conflict: (message = 'Terjadi konflik') => c.json?.({ status: 409, message }, 409),
    unprocessable: (message = 'Entitas tidak dapat diproses') =>
      c.json?.({ status: 422, message }, 422),
    tooManyRequests: (message = 'Terlalu banyak permintaan') =>
      c.json?.({ status: 429, message }, 429),
    internalError: (error?: unknown) =>
      c.json?.(
        {
          status: 500,
          message: 'Terjadi kesalahan pada server',
          error: error instanceof Error ? error.message : error,
        },
        500,
      ),
    notImplemented: (message = 'Fitur belum diimplementasikan') =>
      c.json?.({ status: 501, message }, 501),
    badGateway: (message = 'Gateway bermasalah') => c.json?.({ status: 502, message }, 502),
    serviceUnavailable: (message = 'Layanan tidak tersedia') =>
      c.json?.({ status: 503, message }, 503),
  };
}

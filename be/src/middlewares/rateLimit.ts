import type { AppContext } from '@/contex';
import { ErrorCodes } from '@/http/error-codes';

/**
 * Rate Limiting (API spec §28).
 *
 * Limiter berbasis in-memory fixed window per client (IP, atau userId utk
 * endpoint terautentikasi). Dipakai sebagai `beforeHandle` per route:
 *
 *   beforeHandle: [rateLimit({ windowMs: 60_000, max: 5, keyPrefix: 'login' }).beforeHandle]
 *
 * Batas bawaan PRD (§28):
 *   - Login           5  / menit
 *   - Forgot Password 3  / jam
 *   - Magic Link      5  / jam
 *   - Register        10 / jam
 *   - Attendance      1  / 10 detik
 *   - Upload          10 / menit
 *
 * Catatan: store bersifat per-instance (single-process). Untuk deployment
 * multi-instance gunakan store eksternal (Redis) — dicatat sebagai future
 * enhancement di plan doc.
 */

type RateLimitOptions = {
  /** Panjang jendela waktu dalam milidetik (contoh: 60_000 = 1 menit). */
  windowMs: number;
  /** Jumlah request maksimal dalam satu jendela waktu. */
  max: number;
  /** Awalan key agar tiap endpoint punya bucket terpisah. */
  keyPrefix: string;
  /** Pesan yang dikembalikan saat limit terlampaui. */
  message?: string;
  /** Generator key khusus (default: IP klien). */
  keyGenerator?: (c: AppContext) => string;
};

type WindowEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, WindowEntry>();

/** Bersihkan bucket yang sudah lewat jendelanya. */
function sweepExpiredBuckets(): void {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

// Sweep berkala supaya Map tidak membengkak pada traffic tinggi.
const sweepTimer = setInterval(sweepExpiredBuckets, 60_000);
if (typeof sweepTimer.unref === 'function') {
  sweepTimer.unref();
}

function getClientIp(c: AppContext): string {
  const forwarded = c.request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  const ip = c.server?.requestIP(c.request)?.address;
  return ip ?? 'unknown';
}

/** Key generator berbasis userId — dipakai untuk endpoint terautentikasi. */
export const keyByUser = (c: AppContext): string => c.user?.id ?? 'anonymous';

export const rateLimit = (options: RateLimitOptions) => ({
  beforeHandle: (c: AppContext) => {
    const now = Date.now();
    const identity = options.keyGenerator?.(c) ?? getClientIp(c);
    const key = `${options.keyPrefix}:${identity}`;

    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > options.max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      c.set.headers['Retry-After'] = String(retryAfter);
      return c.json?.(
        {
          status: 429,
          message: options.message ?? 'Terlalu banyak permintaan, coba lagi nanti.',
          code: ErrorCodes.RATE_LIMIT_001,
          retryAfterSeconds: retryAfter,
        },
        429,
      );
    }

    return undefined;
  },
});

/** Konstanta batas bawaan API spec §28. */
export const RateLimitRule = {
  LOGIN: { windowMs: 60_000, max: 5, keyPrefix: 'auth:login' },
  FORGOT_PASSWORD: {
    windowMs: 60 * 60_000,
    max: 3,
    keyPrefix: 'auth:forgot-password',
  },
  MAGIC_LINK: { windowMs: 60 * 60_000, max: 5, keyPrefix: 'auth:magic-link' },
  REGISTER: { windowMs: 60 * 60_000, max: 10, keyPrefix: 'auth:register' },
  ATTENDANCE: { windowMs: 10_000, max: 1, keyPrefix: 'attendance' },
  UPLOAD: { windowMs: 60_000, max: 10, keyPrefix: 'upload' },
} as const;

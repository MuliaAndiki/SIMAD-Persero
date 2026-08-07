import type { AppContext } from "@/contex";
import { ErrorCodes } from "@/http/error-codes";

/**
 * Idempotency (API spec §29).
 *
 * Endpoint wajib idempotent: Check-in, Check-out, Approve Application,
 * Reject Application, Finish Internship, Generate Certificate.
 *
 * Mekanisme: klien mengirim header `Idempotency-Key` (UUID). Middleware
 * menyimpan response sukses (2xx) per key selama TTL (default 24 jam).
 * Request ulang dengan key yang sama akan mengembalikan response yang sama
 * persis tanpa mengeksekusi handler lagi — mencegah data ganda.
 *
 * Pemakaian pada route:
 *   beforeHandle: [...auth..., idempotency().beforeHandle],
 *   afterHandle: [idempotency().afterHandle],
 *
 * Catatan: store in-memory per-instance (single-process). Untuk
 * multi-instance gunakan store eksternal (Redis) — future enhancement.
 */

type IdempotencyOptions = {
  /** Masa berlaku key dalam milidetik (default 24 jam). */
  ttlMs?: number;
};

type IdempotencyEntry =
  | { state: "pending" }
  | { state: "completed"; response: Response; expiresAt: number };

const IDEMPOTENCY_HEADER = "idempotency-key";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

const store = new Map<string, IdempotencyEntry>();

function sweepExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.state === "completed" && entry.expiresAt <= now) {
      store.delete(key);
    }
    if (entry.state === "pending") {
      // Pending yang menggantung > TTL dianggap batal (handler error).
      store.delete(key);
    }
  }
}

const sweepTimer = setInterval(sweepExpiredEntries, 60_000);
if (typeof sweepTimer.unref === "function") {
  sweepTimer.unref();
}

function getKey(c: AppContext): string | null {
  const raw = c.request.headers.get(IDEMPOTENCY_HEADER);
  if (!raw) {
    return null;
  }
  const key = raw.trim();
  return key.length > 0 ? key : null;
}

export const idempotency = (options: IdempotencyOptions = {}) => {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  return {
    beforeHandle: (c: AppContext) => {
      const key = getKey(c);
      if (!key) {
        return undefined;
      }

      const entry = store.get(key);
      if (!entry) {
        store.set(key, { state: "pending" });
        return undefined;
      }

      if (entry.state === "completed" && entry.expiresAt > Date.now()) {
        // Replay response yang sudah tersimpan — handler tidak dieksekusi.
        return entry.response.clone();
      }

      if (entry.state === "completed") {
        store.set(key, { state: "pending" });
        return undefined;
      }

      // Masih diproses oleh request sebelumnya — cegah eksekusi ganda.
      return c.json?.(
        {
          status: 409,
          message:
            "Permintaan dengan Idempotency-Key yang sama sedang diproses. Tunggu hingga selesai atau gunakan key baru.",
          code: ErrorCodes.IDEM_001,
        },
        409,
      );
    },

    afterHandle: (c: AppContext & { response: unknown }) => {
      const key = getKey(c);
      if (!key) {
        return;
      }

      if (
        c.response instanceof Response &&
        c.response.status >= 200 &&
        c.response.status < 300
      ) {
        store.set(key, {
          state: "completed",
          response: c.response,
          expiresAt: Date.now() + ttlMs,
        });
      } else {
        // Gagal (4xx/5xx) — hapus pending agar klien bisa retry dengan key sama.
        store.delete(key);
      }
    },
  };
};

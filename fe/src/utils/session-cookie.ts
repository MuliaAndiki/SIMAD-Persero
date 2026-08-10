import {
  APP_REFRESH_TOKEN_COOKIE_EXPIRES_IN,
  APP_SESSION_COOKIE_KEY,
  APP_SESSION_COOKIE_REFRESH,
  APP_SESSION_COOKIE_ROLE,
} from '@/configs/cookies.config';

/**
 * Helper sesi berbasis cookie (browser).
 *
 * Seluruh token SIMAD disimpan di cookie:
 * - `simad_session` → Access Token (dibaca client-http untuk header Authorization)
 * - `simad_refres`  → Refresh Token (dipakai POST /auth/refresh-token)
 * - `simad_role`    → Role user (untuk guard & redirect dashboard)
 *
 * Backend TIDAK meng-set cookie — token dikembalikan di body respons,
 * sehingga FE bertanggung jawab menyimpan/memperbarui/menghapus cookie.
 */

export interface SessionCookiePayload {
  accessToken: string;
  refreshToken?: string;
  role?: string;
  /** Durasi access token dalam detik (fallback: 3600s = 1 jam, sesuai API spec). */
  expiresIn?: number;
}

/** Durasi access token cookie (detik) bila `expiresIn` tidak dikirim. */
const ACCESS_TOKEN_MAX_AGE = 3600;

/** Durasi cookie refresh token & role (detik) — 24 jam sesuai cookies.config. */
const SESSION_MAX_AGE = APP_REFRESH_TOKEN_COOKIE_EXPIRES_IN / 1000;

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

function writeCookie(name: string, value: string, maxAge: number): void {
  if (!isBrowser()) return;

  const isProduction = process.env.NODE_ENV === 'production';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${
    isProduction ? '; secure' : ''
  }`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;

  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

  if (!match) return undefined;

  const value = match.slice(name.length + 1);
  return value ? decodeURIComponent(value) : undefined;
}

/** Simpan token hasil login / magic-link / refresh ke cookie. */
export function setSessionCookies(session: SessionCookiePayload): void {
  const accessMaxAge = session.expiresIn ?? ACCESS_TOKEN_MAX_AGE;

  writeCookie(APP_SESSION_COOKIE_KEY, session.accessToken, accessMaxAge);

  if (session.refreshToken) {
    writeCookie(APP_SESSION_COOKIE_REFRESH, session.refreshToken, SESSION_MAX_AGE);
  }

  if (session.role) {
    writeCookie(APP_SESSION_COOKIE_ROLE, session.role, SESSION_MAX_AGE);
  }
}

/** Baca access token dari cookie `simad_session`. */
export function getAccessToken(): string | undefined {
  return readCookie(APP_SESSION_COOKIE_KEY);
}

/** Baca refresh token dari cookie `simad_refres`. */
export function getRefreshToken(): string | undefined {
  return readCookie(APP_SESSION_COOKIE_REFRESH);
}

/** Baca role dari cookie `simad_role`. */
export function getRoleCookie(): string | undefined {
  return readCookie(APP_SESSION_COOKIE_ROLE);
}

/** Hapus seluruh cookie sesi (logout / refresh gagal). */
export function clearSessionCookies(): void {
  deleteCookie(APP_SESSION_COOKIE_KEY);
  deleteCookie(APP_SESSION_COOKIE_REFRESH);
  deleteCookie(APP_SESSION_COOKIE_ROLE);
}

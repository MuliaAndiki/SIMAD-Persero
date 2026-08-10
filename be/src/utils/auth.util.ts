import type { JwtPayload } from '@/types/auth.types';
import jwt from 'jsonwebtoken';

/**
 * Role default untuk akun tanpa penugasan role (`user_roles` kosong),
 * mis. akun baru atau data lama sebelum seed dijalankan.
 * Dipakai konsisten oleh login, /auth/me, middleware verifyToken, & user profile.
 */
export const DEFAULT_ROLE_CODE = 'INTERN';

/** Durasi Access Token dalam detik (3600s = 1 jam, sesuai API spec). */
export const ACCESS_TOKEN_TTL = 3600;

/** Durasi Refresh Token dalam detik (7 hari). */
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

/** Durasi token email (verify-email / magic-link / reset-password) dalam detik (24 jam). */
export const EMAIL_TOKEN_TTL = 24 * 60 * 60;

export type EmailTokenPurpose = 'verify-email' | 'magic-link' | 'reset-password' | 'change-email';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
}

/**
 * Validasi password sesuai BR-AUTH-003:
 * - Minimal 8 karakter
 * - Mengandung huruf besar
 * - Mengandung huruf kecil
 * - Mengandung angka
 * (karakter khusus disarankan, tidak wajib)
 */
export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar';
  if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil';
  if (!/\d/.test(password)) return 'Password harus mengandung angka';
  return null;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

export function signEmailToken(
  payload: JwtPayload,
  purpose: EmailTokenPurpose,
  extra: Record<string, unknown> = {},
): string {
  return jwt.sign({ ...payload, purpose, ...extra }, getJwtSecret(), {
    expiresIn: EMAIL_TOKEN_TTL,
  });
}

export function verifyJwtToken(
  token: string,
): JwtPayload & { purpose?: EmailTokenPurpose; newEmail?: string } {
  return jwt.verify(token, getJwtSecret()) as JwtPayload & {
    purpose?: EmailTokenPurpose;
    newEmail?: string;
  };
}

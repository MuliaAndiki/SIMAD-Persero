import type { JwtPayload } from '@/types/auth.types';
import jwt from 'jsonwebtoken';

/**
 * Role default untuk akun tanpa penugasan role (`user_roles` kosong),
 * mis. akun baru atau data lama sebelum seed dijalankan.
 * Dipakai konsisten oleh login, /auth/me, middleware verifyToken, & user profile.
 */
export const DEFAULT_ROLE_CODE = 'intern';

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
 * Validasi password:
 * - Minimal 8 karakter
 * - Mengandung huruf besar (A-Z)
 * - Mengandung huruf kecil (a-z)
 * - Mengandung angka (0-9)
 * - Mengandung karakter khusus / simbol (!@#$%^&*...)
 *
 * Mengembalikan pesan error spesifik dalam bahasa Indonesia,
 * misal: "Password kurang huruf besar", "Password kurang angka",
 * atau jika beberapa kriteria belum terpenuhi:
 * "Password harus terdiri dari huruf besar, angka, dan karakter khusus / simbol"
 */
export function validatePasswordPolicy(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password wajib diisi';
  }

  const missing: string[] = [];
  if (password.length < 8) {
    missing.push('minimal 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    missing.push('huruf besar');
  }
  if (!/[a-z]/.test(password)) {
    missing.push('huruf kecil');
  }
  if (!/\d/.test(password)) {
    missing.push('angka');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password)) {
    missing.push('karakter khusus / simbol');
  }

  if (missing.length === 0) {
    return null;
  }

  // Jika hanya 1 kriteria yang belum terpenuhi:
  if (missing.length === 1) {
    if (missing[0] === 'minimal 8 karakter') {
      return 'Password minimal 8 karakter';
    }
    return `Password kurang ${missing[0]}`;
  }

  // Jika beberapa kriteria belum terpenuhi:
  const formattedMissing =
    missing.length === 2
      ? `${missing[0]} dan ${missing[1]}`
      : `${missing.slice(0, -1).join(', ')}, dan ${missing[missing.length - 1]}`;

  return `Password harus terdiri dari ${formattedMissing}`;
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

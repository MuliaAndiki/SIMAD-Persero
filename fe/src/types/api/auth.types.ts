/**
 * Tipe payload & respons modul Auth.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/auth.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/AuthController.ts).
 */

import type { IRefreshToken, IUser } from './model.type';

// ---------- Payload (request body / path params) ----------

export interface RegisterBody extends Pick<IUser, 'fullName' | 'email'> {
  password?: string;
}

export interface SendVerifyEmailBody {
  email: string;
}

export interface VerifyEmailBody {
  token: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface SendMagicLinkBody {
  email: string;
}

export interface VerifyMagicLinkBody {
  token: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface LogoutBody {
  refreshToken?: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailBody {
  newEmail: string;
  password: string;
}

export interface ChangeEmailVerifyBody {
  token: string;
}

export interface SessionParams {
  sessionId: string;
}

// ---------- Response (data dari backend) ----------

/** Data hasil registrasi akun baru. */
export interface RegisterResponse {
  userId: string;
  email: string;
}

/** User ringkas yang dibawa di dalam session login / magic link. */
export interface AuthSessionUser extends Pick<IUser, 'id' | 'fullName'> {
  role: string;
}

/** Data hasil login / verify magic link. */
export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthSessionUser;
}

/** Data hasil refresh token. */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/** Data profil pengguna saat ini (GET /auth/me). */
export interface SafeAuthUser extends Pick<IUser, 'id' | 'fullName' | 'email'> {
  role: string;
}

/** Data satu sesi aktif (GET /auth/sessions). */
export interface AuthSession extends Pick<IRefreshToken, 'id'> {
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

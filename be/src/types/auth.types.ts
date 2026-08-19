/**
 * Types modul Auth.
 * Diturunkan dari base model `IUser` (models.types.ts) memakai Utility Types.
 *
 * Catatan: User model pada skema baru TIDAK memiliki field `role` / `token`.
 * Role diambil melalui tabel join `UserRole` dan dilampirkan oleh middleware
 * sebagai `AuthUser.roles` (array kode role).
 */
import type { IUser } from "./models.types";

/** Payload yang disimpan di dalam JWT Access Token. */
export type JwtPayload = Pick<IUser, "id" | "email" | "fullName">;

/** User context yang dilampirkan middleware `verifyToken` ke `c.user`. */
export type AuthUser = JwtPayload &
  Pick<IUser, "emailVerified" | "isActive"> & {
    roles: string[];
  };

export type RegisterBody = Pick<IUser, "fullName" | "email"> & {
  password: string;
};

export type LoginBody = Pick<IUser, "email"> & {
  password: string;
};

/** Body untuk login dengan Google (POST /auth/oauth). */
export type GoogleLoginBody = {
  credential: string;
};

export type TokenBody = {
  token: string;
};

export type EmailBody = Pick<IUser, "email">;

export type ResetPasswordBody = {
  token: string;
  password: string;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeEmailBody = {
  newEmail: string;
  password: string;
};

export type ChangeEmailVerifyBody = {
  token: string;
};

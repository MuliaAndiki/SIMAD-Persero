/**
 * Tipe payload & respons modul User.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/user.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/UserController.ts).
 */

import type { IUser } from './model.type';

// ---------- Payload (request body / path params) ----------

export type UpdateProfileBody = Partial<Pick<IUser, 'fullName'>> & {
  phone?: string;
};

export interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

// ---------- Response (data dari backend) ----------

/** Profil pengguna saat ini (GET /users/profile, PATCH /users/profile). */
export interface ProfileResponse extends Pick<IUser, 'id' | 'fullName' | 'email'> {
  phone: string | null;
  role: string;
  profilePhoto: string | null;
}

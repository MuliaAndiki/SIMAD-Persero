/**
 * Types modul User.
 * Menjaga kontrak data antara controller, service, dan routes.
 * Diturunkan dari base model `IUser` / `IInternProfile` (models.types.ts)
 * memakai TypeScript Utility Types.
 * Sumber aturan: docs/07-api-specification.md §13.
 */
import type { IInternProfile, IUser } from './models.types';

/** PATCH /users/profile body — hanya profil publik yang boleh diubah. */
export type UpdateProfileBody = Partial<Pick<IUser, 'fullName'> & Pick<IInternProfile, 'phone'>>;

/** PATCH /users/change-password body. */
export type ChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
};

/** GET /users/profile response. */
export interface ProfileResponse {
  id: IUser['id'];
  fullName: IUser['fullName'];
  email: IUser['email'];
  phone: IInternProfile['phone'] | null;
  role: string;
  profilePhoto: IUser['avatarFileId'];
}

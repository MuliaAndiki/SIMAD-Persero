import { MAX_FILE_SIZE } from '@/utils/storage.util';
import { t } from 'elysia';

/**
 * DTO (Data Transfer Object) modul User.
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih
 * dan skema bisa dipakai ulang / diuji secara terpisah.
 * Sumber aturan: docs/07-api-specification.md §13.
 */

// PATCH /users/profile
export const UpdateProfileDto = t.Partial(
  t.Object({
    fullName: t.String({
      minLength: 2,
      maxLength: 150,
      description: 'Nama lengkap',
    }),
    phone: t.String({
      minLength: 8,
      maxLength: 30,
      description: 'Nomor telepon',
    }),
  }),
);

// POST /users/profile/photo
export const UploadProfilePhotoDto = t.Object({
  photo: t.File({
    type: ['image/jpeg', 'image/png'],
    maxSize: MAX_FILE_SIZE,
    description: 'Foto profil JPG/JPEG/PNG maksimal 5 MB',
  }),
});

// PATCH /users/change-password
export const ChangePasswordDto = t.Object({
  oldPassword: t.String({ description: 'Kata sandi lama' }),
  newPassword: t.String({
    minLength: 8,
    maxLength: 100,
    description: 'Kata sandi baru',
  }),
});

import type { AppContext } from '@/contex';
import UserController from '@/controllers/UserController';
import { ChangePasswordDto, UpdateProfileDto, UploadProfilePhotoDto } from '@/dtos/user.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import { RateLimitRule, keyByUser, rateLimit } from '@/middlewares/rateLimit';
import Elysia from 'elysia';

/**
 * Routes modul User.
 * Base URL: /users
 * Sumber aturan: docs/07-api-specification.md §13.
 * - Profile (get/update/photo) : INTERN, HR_ADMIN, SUPERVISOR
 * - Change password            : semua user yang sudah login
 */
class UserRouter {
  public userRouter;

  constructor() {
    this.userRouter = new Elysia({ prefix: '/users' });
    this.routes();
  }

  private routes() {
    // GET /users/profile
    this.userRouter.get('/profile', (c: AppContext) => UserController.getProfile(c), {
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR']).beforeHandle,
      ],
      detail: {
        summary: 'Profil pengguna saat ini',
        description: 'Mengembalikan profil pengguna yang sedang login.',
        tags: ['User'],
      },
    });

    // PATCH /users/profile
    this.userRouter.patch('/profile', (c: AppContext) => UserController.updateProfile(c), {
      body: UpdateProfileDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR']).beforeHandle,
      ],
      detail: {
        summary: 'Ubah profil',
        description: 'Memperbarui profil pengguna. Email dan role tidak dapat diubah.',
        tags: ['User'],
      },
    });

    // POST /users/profile/photo
    this.userRouter.post('/profile/photo', (c: AppContext) => UserController.uploadPhoto(c), {
      body: UploadProfilePhotoDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR']).beforeHandle,
        rateLimit({ ...RateLimitRule.UPLOAD, keyGenerator: keyByUser }).beforeHandle,
      ],
      detail: {
        summary: 'Upload foto profil',
        description: 'Upload foto profil JPG/JPEG/PNG maksimal 5 MB. Foto lama diganti.',
        tags: ['User'],
      },
    });

    // PATCH /users/change-password
    this.userRouter.patch('/change-password', (c: AppContext) => UserController.changePassword(c), {
      body: ChangePasswordDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Ubah password',
        description: 'Mengubah password pengguna yang sedang login (oldPassword + newPassword).',
        tags: ['User'],
      },
    });
  }
}

export default new UserRouter().userRouter;

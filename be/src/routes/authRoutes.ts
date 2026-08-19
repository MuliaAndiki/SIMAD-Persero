import type { AppContext } from '@/contex';
import AuthController from '@/controllers/AuthController';
import {
  ChangeEmailDto,
  ChangeEmailVerifyDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  SendMagicLinkDto,
  SendVerifyEmailDto,
  SessionParamsDto,
  VerifyEmailDto,
  VerifyMagicLinkDto,
} from '@/dtos/auth.dto';
import { verifyToken } from '@/middlewares/auth';
import { RateLimitRule, rateLimit } from '@/middlewares/rateLimit';
import Elysia from 'elysia';

class AuthRouter {
  public authRouter;

  constructor() {
    this.authRouter = new Elysia({ prefix: '/auth' });
    this.routes();
  }

  private routes() {
    // POST /auth/register
    this.authRouter.post('/register', (c: AppContext) => AuthController.register(c), {
      body: RegisterDto,
      beforeHandle: [rateLimit(RateLimitRule.REGISTER).beforeHandle],
      detail: {
        summary: 'Registrasi akun baru',
        description: 'Mendaftarkan pengguna baru ke sistem.',
        tags: ['Auth'],
      },
    });

    // POST /auth/verify-email/send
    this.authRouter.post(
      '/verify-email/send',
      (c: AppContext) => AuthController.sendVerifyEmail(c),
      {
        body: SendVerifyEmailDto,
        detail: {
          summary: 'Kirim ulang email verifikasi',
          description: 'Mengirim email berisi token verifikasi ke email pengguna.',
          tags: ['Auth'],
        },
      },
    );

    // POST /auth/verify-email
    this.authRouter.post('/verify-email', (c: AppContext) => AuthController.verifyEmail(c), {
      body: VerifyEmailDto,
      detail: {
        summary: 'Verifikasi email',
        description: 'Memverifikasi email pengguna menggunakan token dari email.',
        tags: ['Auth'],
      },
    });

    // POST /auth/login
    this.authRouter.post('/login', (c: AppContext) => AuthController.login(c), {
      body: LoginDto,
      beforeHandle: [rateLimit(RateLimitRule.LOGIN).beforeHandle],
      detail: {
        summary: 'Login pengguna',
        description:
          'Autentikasi dengan email dan password. Mengembalikan accessToken + refreshToken.',
        tags: ['Auth'],
      },
    });

    // POST /auth/oauth
    this.authRouter.post('/oauth', (c: AppContext) => AuthController.googleLogin(c), {
      body: GoogleLoginDto,
      beforeHandle: [rateLimit(RateLimitRule.LOGIN).beforeHandle],
      detail: {
        summary: 'Login dengan Google',
        description:
          'Menukar Google ID Token (credential) menjadi sesi JWT. Akun baru dibuat otomatis dengan role INTERN bila email belum terdaftar.',
        tags: ['Auth'],
      },
    });

    // POST /auth/magic-link/send
    this.authRouter.post('/magic-link/send', (c: AppContext) => AuthController.sendMagicLink(c), {
      body: SendMagicLinkDto,
      beforeHandle: [rateLimit(RateLimitRule.MAGIC_LINK).beforeHandle],
      detail: {
        summary: 'Kirim magic link login',
        description: 'Mengirim link login sekali pakai ke email pengguna.',
        tags: ['Auth'],
      },
    });

    // POST /auth/magic-link/verify
    this.authRouter.post(
      '/magic-link/verify',
      (c: AppContext) => AuthController.verifyMagicLink(c),
      {
        body: VerifyMagicLinkDto,
        detail: {
          summary: 'Verifikasi magic link',
          description: 'Menukar token magic link menjadi session JWT.',
          tags: ['Auth'],
        },
      },
    );

    // POST /auth/forgot-password
    this.authRouter.post('/forgot-password', (c: AppContext) => AuthController.forgotPassword(c), {
      body: ForgotPasswordDto,
      beforeHandle: [rateLimit(RateLimitRule.FORGOT_PASSWORD).beforeHandle],
      detail: {
        summary: 'Lupa password',
        description: 'Mengirim email berisi token untuk reset password.',
        tags: ['Auth'],
      },
    });

    // POST /auth/reset-password
    this.authRouter.post('/reset-password', (c: AppContext) => AuthController.resetPassword(c), {
      body: ResetPasswordDto,
      detail: {
        summary: 'Reset password',
        description: 'Mereset password pengguna menggunakan token dari email.',
        tags: ['Auth'],
      },
    });

    // POST /auth/refresh-token
    this.authRouter.post('/refresh-token', (c: AppContext) => AuthController.refreshToken(c), {
      body: RefreshTokenDto,
      detail: {
        summary: 'Refresh access token',
        description: 'Menukar refresh token dengan access token baru.',
        tags: ['Auth'],
      },
    });

    // POST /auth/logout
    this.authRouter.post('/logout', (c: AppContext) => AuthController.logout(c), {
      body: LogoutDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Logout pengguna',
        description: 'Membatalkan sesi saat ini. Membutuhkan header Authorization Bearer.',
        tags: ['Auth'],
      },
    });

    // POST /auth/logout-all
    this.authRouter.post('/logout-all', (c: AppContext) => AuthController.logoutAll(c), {
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Logout semua perangkat',
        description: 'Membatalkan seluruh sesi aktif pengguna.',
        tags: ['Auth'],
      },
    });

    // GET /auth/me
    this.authRouter.get('/me', (c: AppContext) => AuthController.me(c), {
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Profil pengguna saat ini',
        description: 'Mengembalikan data profil pengguna yang sedang login.',
        tags: ['Auth'],
      },
    });

    // PATCH /auth/change-password
    this.authRouter.patch('/change-password', (c: AppContext) => AuthController.changePassword(c), {
      body: ChangePasswordDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Ubah password',
        description: 'Mengubah password pengguna yang sedang login.',
        tags: ['Auth'],
      },
    });

    // PATCH /auth/change-email
    this.authRouter.patch('/change-email', (c: AppContext) => AuthController.changeEmail(c), {
      body: ChangeEmailDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Ubah email',
        description: 'Mengajukan perubahan email dan mengirim token konfirmasi.',
        tags: ['Auth'],
      },
    });

    // POST /auth/change-email/verify
    this.authRouter.post(
      '/change-email/verify',
      (c: AppContext) => AuthController.changeEmailVerify(c),
      {
        body: ChangeEmailVerifyDto,
        beforeHandle: [verifyToken().beforeHandle],
        detail: {
          summary: 'Verifikasi perubahan email',
          description: 'Menyelesaikan perubahan email menggunakan token konfirmasi.',
          tags: ['Auth'],
        },
      },
    );

    // GET /auth/sessions
    this.authRouter.get('/sessions', (c: AppContext) => AuthController.sessions(c), {
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Daftar sesi aktif',
        description: 'Mengembalikan seluruh sesi aktif pengguna.',
        tags: ['Auth'],
      },
    });

    // DELETE /auth/sessions/:sessionId
    this.authRouter.delete(
      '/sessions/:sessionId',
      (c: AppContext) => AuthController.deleteSession(c),
      {
        params: SessionParamsDto,
        beforeHandle: [verifyToken().beforeHandle],
        detail: {
          summary: 'Hapus sesi',
          description: 'Membatalkan sesi tertentu berdasarkan ID sesi.',
          tags: ['Auth'],
        },
      },
    );
  }
}

export default new AuthRouter().authRouter;

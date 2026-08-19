import { t } from 'elysia';

/**
 * DTO (Data Transfer Object) modul Auth.
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih
 * dan skema bisa dipakai ulang / diuji secara terpisah.
 */

// POST /auth/register
export const RegisterDto = t.Object({
  fullName: t.String({
    minLength: 2,
    maxLength: 150,
    description: 'Nama lengkap',
  }),
  email: t.String({ format: 'email', description: 'Alamat email' }),
  password: t.String({
    minLength: 8,
    maxLength: 100,
    description: 'Kata sandi',
  }),
});

// POST /auth/verify-email/send
export const SendVerifyEmailDto = t.Object({
  email: t.String({ format: 'email', description: 'Alamat email' }),
});

// POST /auth/verify-email
export const VerifyEmailDto = t.Object({
  token: t.String({ description: 'Token verifikasi email' }),
});

// POST /auth/login
export const LoginDto = t.Object({
  email: t.String({ format: 'email', description: 'Alamat email' }),
  password: t.String({ description: 'Kata sandi' }),
});

// POST /auth/oauth
export const GoogleLoginDto = t.Object({
  credential: t.String({
    minLength: 10,
    description: 'Google ID Token (credential) yang dihasilkan oleh Google Identity Services',
  }),
});

// POST /auth/magic-link/send
export const SendMagicLinkDto = t.Object({
  email: t.String({ format: 'email', description: 'Alamat email' }),
});

// POST /auth/magic-link/verify
export const VerifyMagicLinkDto = t.Object({
  token: t.String({ description: 'Token magic link' }),
});

// POST /auth/forgot-password
export const ForgotPasswordDto = t.Object({
  email: t.String({ format: 'email', description: 'Alamat email' }),
});

// POST /auth/reset-password
export const ResetPasswordDto = t.Object({
  token: t.String({ description: 'Token reset password' }),
  password: t.String({
    minLength: 8,
    maxLength: 100,
    description: 'Kata sandi baru',
  }),
});

// POST /auth/refresh-token
export const RefreshTokenDto = t.Object({
  refreshToken: t.String({ description: 'Refresh token' }),
});

// POST /auth/logout
export const LogoutDto = t.Optional(
  t.Object({
    refreshToken: t.Optional(t.String({ description: 'Refresh token' })),
  }),
);

// PATCH /auth/change-password
export const ChangePasswordDto = t.Object({
  currentPassword: t.String({ description: 'Kata sandi saat ini' }),
  newPassword: t.String({
    minLength: 8,
    maxLength: 100,
    description: 'Kata sandi baru',
  }),
});

// PATCH /auth/change-email
export const ChangeEmailDto = t.Object({
  newEmail: t.String({ format: 'email', description: 'Alamat email baru' }),
  password: t.String({ description: 'Kata sandi untuk konfirmasi' }),
});

// POST /auth/change-email/verify
export const ChangeEmailVerifyDto = t.Object({
  token: t.String({ description: 'Token konfirmasi perubahan email' }),
});

// DELETE /auth/sessions/:sessionId
export const SessionParamsDto = t.Object({
  sessionId: t.String({ description: 'ID sesi' }),
});

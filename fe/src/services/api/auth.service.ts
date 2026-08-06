import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { AUTH_ENDPOINTS } from '@/configs/endpoints/auth.endpoints';
import type {
  AuthSession,
  AuthSessionResponse,
  ChangeEmailBody,
  ChangeEmailVerifyBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  RefreshTokenResponse,
  RegisterBody,
  RegisterResponse,
  ResetPasswordBody,
  SafeAuthUser,
  SendMagicLinkBody,
  SendVerifyEmailBody,
  SessionParams,
  VerifyEmailBody,
  VerifyMagicLinkBody,
} from '@/types/api/auth.types';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Auth — 17 method, satu method per endpoint backend
 * (be/src/routes/authRoutes.ts).
 *
 * Method fetch diambil dari `Api().client` (fe/src/api/client/client-http.ts)
 * karena seluruh aksi auth (register, login, logout, ...) dieksekusi di
 * browser dan access token otomatis dibaca dari cookie sesi. Untuk konteks
 * server (route handler / server action) gunakan `Api().server`
 * (fe/src/api/server/server-fetch.ts).
 */
const { client } = Api();

class AuthService {
  /**
   * POST /auth/register
   * Mendaftarkan akun pengguna baru.
   */
  public async Register(
    body: Pick<RegisterBody, 'fullName' | 'email' | 'password'>,
  ): Promise<TResponse<RegisterResponse>> {
    const res = await client.PublicPostResponse<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, body);
    return toServiceResponse(res, {
      message: 'Registrasi berhasil',
      statusCode: 201,
    });
  }

  /**
   * POST /auth/verify-email/send
   * Mengirim ulang email verifikasi.
   */
  public async SendVerifyEmail(body: Pick<SendVerifyEmailBody, 'email'>): Promise<TResponse<null>> {
    const res = await client.PublicPostResponse<null>(AUTH_ENDPOINTS.SEND_VERIFY_EMAIL, body);
    return toServiceResponse(res, { message: 'Email verifikasi terkirim' });
  }

  /**
   * POST /auth/verify-email
   * Memverifikasi email pengguna menggunakan token dari email.
   */
  public async VerifyEmail(body: Pick<VerifyEmailBody, 'token'>): Promise<TResponse<null>> {
    const res = await client.PublicPostResponse<null>(AUTH_ENDPOINTS.VERIFY_EMAIL, body);
    return toServiceResponse(res, { message: 'Email berhasil diverifikasi' });
  }

  /**
   * POST /auth/login
   * Login dengan email dan password.
   */
  public async Login(
    body: Pick<LoginBody, 'email' | 'password'>,
  ): Promise<TResponse<AuthSessionResponse>> {
    const res = await client.PublicPostResponse<AuthSessionResponse>(AUTH_ENDPOINTS.LOGIN, body);
    return toServiceResponse(res, { message: 'Login berhasil' });
  }

  /**
   * POST /auth/magic-link/send
   * Mengirim magic link login sekali pakai ke email.
   */
  public async SendMagicLink(body: Pick<SendMagicLinkBody, 'email'>): Promise<TResponse<null>> {
    const res = await client.PublicPostResponse<null>(AUTH_ENDPOINTS.SEND_MAGIC_LINK, body);
    return toServiceResponse(res, { message: 'Magic link terkirim' });
  }

  /**
   * POST /auth/magic-link/verify
   * Menukar token magic link menjadi session JWT.
   */
  public async VerifyMagicLink(
    body: Pick<VerifyMagicLinkBody, 'token'>,
  ): Promise<TResponse<AuthSessionResponse>> {
    const res = await client.PublicPostResponse<AuthSessionResponse>(
      AUTH_ENDPOINTS.VERIFY_MAGIC_LINK,
      body,
    );
    return toServiceResponse(res, { message: 'Login berhasil' });
  }

  /**
   * POST /auth/forgot-password
   * Mengirim email berisi token reset password.
   */
  public async ForgotPassword(body: Pick<ForgotPasswordBody, 'email'>): Promise<TResponse<null>> {
    const res = await client.PublicPostResponse<null>(AUTH_ENDPOINTS.FORGOT_PASSWORD, body);
    return toServiceResponse(res, { message: 'Link reset password terkirim' });
  }

  /**
   * POST /auth/reset-password
   * Mereset password pengguna menggunakan token dari email.
   */
  public async ResetPassword(
    body: Pick<ResetPasswordBody, 'token' | 'password'>,
  ): Promise<TResponse<null>> {
    const res = await client.PublicPostResponse<null>(AUTH_ENDPOINTS.RESET_PASSWORD, body);
    return toServiceResponse(res, { message: 'Password berhasil direset' });
  }

  /**
   * POST /auth/refresh-token
   * Menukar refresh token dengan access token baru.
   */
  public async RefreshToken(
    body: Pick<RefreshTokenBody, 'refreshToken'>,
  ): Promise<TResponse<RefreshTokenResponse>> {
    const res = await client.PublicPostResponse<RefreshTokenResponse>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      body,
    );
    return toServiceResponse(res, { message: 'Token berhasil diperbarui' });
  }

  /**
   * POST /auth/logout
   * Membatalkan sesi saat ini (butuh auth).
   */
  public async Logout(body: Pick<LogoutBody, 'refreshToken'>): Promise<TResponse<null>> {
    const res = await client.PostResponse<null>(AUTH_ENDPOINTS.LOGOUT, body);
    return toServiceResponse(res, { message: 'Logout berhasil' });
  }

  /**
   * POST /auth/logout-all
   * Membatalkan seluruh sesi aktif pengguna (butuh auth).
   */
  public async LogoutAll(): Promise<TResponse<null>> {
    const res = await client.PostResponse<null>(AUTH_ENDPOINTS.LOGOUT_ALL, {});
    return toServiceResponse(res, { message: 'Semua sesi diakhiri' });
  }

  /**
   * GET /auth/me
   * Mengambil profil pengguna yang sedang login (butuh auth).
   */
  public async Me(): Promise<TResponse<SafeAuthUser>> {
    const res = await client.GetResponse<SafeAuthUser>(AUTH_ENDPOINTS.ME);
    return toServiceResponse(res, { message: 'Profil berhasil dimuat' });
  }

  /**
   * PATCH /auth/change-password
   * Mengubah password pengguna (butuh auth).
   */
  public async ChangePassword(
    body: Pick<ChangePasswordBody, 'currentPassword' | 'newPassword'>,
  ): Promise<TResponse<null>> {
    const res = await client.PatchResponse<null>(AUTH_ENDPOINTS.CHANGE_PASSWORD, body);
    return toServiceResponse(res, { message: 'Password berhasil diubah' });
  }

  /**
   * PATCH /auth/change-email
   * Mengajukan perubahan email dan mengirim token konfirmasi (butuh auth).
   */
  public async ChangeEmail(
    body: Pick<ChangeEmailBody, 'newEmail' | 'password'>,
  ): Promise<TResponse<null>> {
    const res = await client.PatchResponse<null>(AUTH_ENDPOINTS.CHANGE_EMAIL, body);
    return toServiceResponse(res, {
      message: 'Email verifikasi terkirim ke alamat baru',
    });
  }

  /**
   * POST /auth/change-email/verify
   * Menyelesaikan perubahan email menggunakan token konfirmasi (butuh auth).
   */
  public async ChangeEmailVerify(
    body: Pick<ChangeEmailVerifyBody, 'token'>,
  ): Promise<TResponse<null>> {
    const res = await client.PostResponse<null>(AUTH_ENDPOINTS.CHANGE_EMAIL_VERIFY, body);
    return toServiceResponse(res, { message: 'Email berhasil diubah' });
  }

  /**
   * GET /auth/sessions
   * Mengambil seluruh sesi aktif pengguna (butuh auth).
   */
  public async Sessions(): Promise<TResponse<AuthSession[]>> {
    const res = await client.GetResponse<AuthSession[]>(AUTH_ENDPOINTS.SESSIONS);
    return toServiceResponse(res, { message: 'Daftar sesi berhasil dimuat' });
  }

  /**
   * DELETE /auth/sessions/:sessionId
   * Membatalkan sesi tertentu berdasarkan ID sesi (butuh auth).
   */
  public async DeleteSession(params: Pick<SessionParams, 'sessionId'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(AUTH_ENDPOINTS.SESSION(params.sessionId));
    return toServiceResponse(res, { message: 'Sesi berakhir' });
  }
}

export default new AuthService();

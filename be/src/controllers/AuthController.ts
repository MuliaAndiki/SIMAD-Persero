import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import AuthService from '@/services/auth.service';
import type {
  ChangeEmailBody,
  ChangeEmailVerifyBody,
  ChangePasswordBody,
  EmailBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
  TokenBody,
} from '@/types/auth.types';

/**
 * Controller modul Auth — tipis.
 * Hanya bertugas mengekstrak input dari context (body/params/user/header),
 * memanggil `AuthService`, lalu memetakan hasil ke respons HTTP
 * menggunakan helper resmi `HttpResponse` dari `@/http`.
 * Seluruh logika bisnis berada di `AuthService`.
 */
class AuthController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // POST /auth/register
  public async register(c: AppContext) {
    try {
      const body = c.body as RegisterBody;
      const data = await AuthService.register({
        fullName: body.fullName,
        email: body.email,
        password: body.password,
      });
      return HttpResponse(c).created(data, 'Registration successful. Please verify your email.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/verify-email/send
  public async sendVerifyEmail(c: AppContext) {
    try {
      const body = c.body as EmailBody;
      await AuthService.sendVerifyEmail(body.email);
      return HttpResponse(c).ok(undefined, undefined, 'Verification email sent');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/verify-email
  public async verifyEmail(c: AppContext) {
    try {
      const body = c.body as TokenBody;
      const result = await AuthService.verifyEmail(body.token);
      return HttpResponse(c).ok(
        undefined,
        undefined,
        result.alreadyVerified ? 'Email already verified' : 'Email verified successfully',
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/login
  public async login(c: AppContext) {
    try {
      const body = c.body as LoginBody;
      const data = await AuthService.login(body.email, body.password);
      return HttpResponse(c).ok(data, undefined, 'Login successful');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/magic-link/send
  public async sendMagicLink(c: AppContext) {
    try {
      const body = c.body as EmailBody;
      await AuthService.sendMagicLink(body.email);
      return HttpResponse(c).ok(undefined, undefined, 'Magic link sent');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/magic-link/verify
  public async verifyMagicLink(c: AppContext) {
    try {
      const body = c.body as TokenBody;
      const data = await AuthService.verifyMagicLink(body.token);
      return HttpResponse(c).ok(data, undefined, 'Login successful');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/forgot-password
  public async forgotPassword(c: AppContext) {
    try {
      const body = c.body as EmailBody;
      await AuthService.forgotPassword(body.email);
      return HttpResponse(c).ok(undefined, undefined, 'Password reset link has been sent');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/reset-password
  public async resetPassword(c: AppContext) {
    try {
      const body = c.body as ResetPasswordBody;
      await AuthService.resetPassword(body.token, body.password);
      return HttpResponse(c).ok(undefined, undefined, 'Password updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/refresh-token
  public async refreshToken(c: AppContext) {
    try {
      const body = c.body as RefreshTokenBody;
      const data = await AuthService.refreshToken(body.refreshToken);
      return HttpResponse(c).ok(data, undefined, 'Token refreshed');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/logout
  public async logout(c: AppContext) {
    try {
      const user = c.user!;
      const body = (c.body ?? {}) as Partial<RefreshTokenBody>;
      await AuthService.logout(user.id, body.refreshToken);
      return HttpResponse(c).ok(undefined, undefined, 'Logout successful');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/logout-all
  public async logoutAll(c: AppContext) {
    try {
      const user = c.user!;
      await AuthService.logoutAll(user.id);
      return HttpResponse(c).ok(undefined, undefined, 'All sessions ended');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /auth/me
  public async me(c: AppContext) {
    try {
      const user = c.user!;
      const data = AuthService.me(user);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /auth/change-password
  public async changePassword(c: AppContext) {
    try {
      const user = c.user!;
      const body = c.body as ChangePasswordBody;
      await AuthService.changePassword(user.id, body.currentPassword, body.newPassword);
      return HttpResponse(c).ok(undefined, undefined, 'Password changed successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /auth/change-email
  public async changeEmail(c: AppContext) {
    try {
      const user = c.user!;
      const body = c.body as ChangeEmailBody;
      await AuthService.changeEmail(user.id, body.newEmail, body.password);
      return HttpResponse(c).ok(undefined, undefined, 'Verification email sent to the new address');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /auth/change-email/verify
  public async changeEmailVerify(c: AppContext) {
    try {
      const user = c.user!;
      const body = c.body as ChangeEmailVerifyBody;
      await AuthService.changeEmailVerify(user.id, body.token);
      return HttpResponse(c).ok(undefined, undefined, 'Email updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /auth/sessions
  public async sessions(c: AppContext) {
    try {
      const user = c.user!;
      const currentToken = this.getBearerToken(c);
      const data = await AuthService.sessions(user.id, currentToken);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /auth/sessions/:sessionId
  public async deleteSession(c: AppContext) {
    try {
      const user = c.user!;
      const sessionId = c.params?.sessionId;
      await AuthService.deleteSession(user.id, sessionId);
      return HttpResponse(c).ok(undefined, undefined, 'Session ended');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  private getBearerToken(c: AppContext): string | null {
    const authHeader = c.request.headers.get('authorization');
    return authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  }
}

export default new AuthController();

import { AppError } from '@/http/error';
import { buildFrontendUrl, sendEmail } from '@/services/email.service';
import type { AuthUser, JwtPayload } from '@/types/auth.types';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  type EmailTokenPurpose,
  signAccessToken,
  signEmailToken,
  signRefreshToken,
  validatePasswordPolicy,
  verifyJwtToken,
} from '@/utils/auth.util';
import bcryptjs from 'bcryptjs';
import prisma from '../../prisma/client';

const DEFAULT_ROLE_CODE = 'INTERN';

/**
 * Service layer modul Auth.
 * Seluruh logika bisnis (validasi, query DB, token, email) berada di sini.
 * Method menerima parameter plain (bukan `AppContext`) dan mengembalikan data
 * mentah; kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Controller cukup memanggil method ini dan memetakan hasilnya ke HTTP.
 */
class AuthService {
  // ===== Private helpers =====

  private getRoleCode(userRoles: { role: { code: string } }[]): string {
    return userRoles[0]?.role.code ?? DEFAULT_ROLE_CODE;
  }

  /**
   * Membuat sesi login: simpan Refresh Token baru + update lastLoginAt.
   * Dipakai oleh `login` dan `verifyMagicLink`.
   */
  private async createSession(
    userId: string,
    payload: JwtPayload,
  ): Promise<{ refreshToken: string }> {
    const refreshToken = signRefreshToken(payload);
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId,
          token: refreshToken,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      }),
    ]);
    return { refreshToken };
  }

  private verifyEmailToken(token: string, purpose: EmailTokenPurpose) {
    let decoded: ReturnType<typeof verifyJwtToken>;
    try {
      decoded = verifyJwtToken(token);
    } catch {
      throw new AppError(400, 'Token is invalid or expired');
    }
    if (decoded.purpose !== purpose) {
      throw new AppError(400, 'Token is invalid or expired');
    }
    return decoded;
  }

  private async findActiveUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new AppError(401, 'Account not found');
    }
    return user;
  }

  private async findLoginUser(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  // ===== POST /auth/register =====

  public async register(input: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const fullName = input.fullName?.trim();
    const email = input.email?.toLowerCase().trim();
    const password = input.password;

    if (!fullName || !email || !password) {
      throw new AppError(400, 'All fields are required');
    }

    const policyError = validatePasswordPolicy(password);
    if (policyError) {
      throw new AppError(400, policyError);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const role = await prisma.role.findUnique({
      where: { code: DEFAULT_ROLE_CODE },
    });

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        emailVerified: false,
        isActive: true,
        userRoles: role ? { create: [{ roleId: role.id }] } : undefined,
      },
    });

    const token = signEmailToken(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      'verify-email',
    );
    const verifyUrl = buildFrontendUrl(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    await sendEmail({
      to: newUser.email,
      subject: 'Verifikasi Email SIMAD',
      text: `Halo ${newUser.fullName},\n\nVerifikasi email kamu melalui link berikut:\n${verifyUrl}\n\nAtau gunakan token:\n${token}\n\nToken berlaku 24 jam.`,
    });

    return { userId: newUser.id, email: newUser.email };
  }

  // ===== POST /auth/verify-email/send =====

  public async sendVerifyEmail(email: string) {
    const normalized = email?.toLowerCase().trim();
    if (!normalized) {
      throw new AppError(400, 'Email is required');
    }

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user || user.deletedAt) {
      throw new AppError(404, 'Account not found');
    }
    if (user.emailVerified) {
      throw new AppError(400, 'Email already verified');
    }

    const token = signEmailToken(
      { id: user.id, email: user.email, fullName: user.fullName },
      'verify-email',
    );
    const verifyUrl = buildFrontendUrl(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    await sendEmail({
      to: user.email,
      subject: 'Verifikasi Email SIMAD',
      text: `Halo ${user.fullName},\n\nVerifikasi email kamu melalui link berikut:\n${verifyUrl}\n\nAtau gunakan token:\n${token}\n\nToken berlaku 24 jam.`,
    });
  }

  // ===== POST /auth/verify-email =====

  public async verifyEmail(token: string) {
    if (!token) {
      throw new AppError(400, 'Token is required');
    }

    const decoded = this.verifyEmailToken(token, 'verify-email');

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.deletedAt) {
      throw new AppError(404, 'Account not found');
    }
    if (user.emailVerified) {
      return { alreadyVerified: true };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });

    return { alreadyVerified: false };
  }

  // ===== POST /auth/login =====

  public async login(email: string, password: string) {
    const normalized = email?.toLowerCase().trim();
    if (!normalized || !password) {
      throw new AppError(400, 'All fields are required');
    }

    const user = await this.findLoginUser(normalized);
    if (!user || user.deletedAt || !user.password) {
      throw new AppError(401, 'Invalid email or password');
    }
    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated');
    }
    if (!user.emailVerified) {
      throw new AppError(403, 'Email not verified. Please verify your email first.');
    }

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    const accessToken = signAccessToken(payload);
    const { refreshToken } = await this.createSession(user.id, payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: this.getRoleCode(user.userRoles),
      },
    };
  }

  // ===== POST /auth/magic-link/send =====

  public async sendMagicLink(email: string) {
    const normalized = email?.toLowerCase().trim();
    if (!normalized) {
      throw new AppError(400, 'Email is required');
    }

    // Anti user enumeration: selalu sukses, email hanya dikirim bila akun valid.
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user || user.deletedAt || !user.isActive || !user.emailVerified) {
      return;
    }

    const token = signEmailToken(
      { id: user.id, email: user.email, fullName: user.fullName },
      'magic-link',
    );
    const magicUrl = buildFrontendUrl(`/auth/magic-link?token=${encodeURIComponent(token)}`);
    await sendEmail({
      to: user.email,
      subject: 'Magic Link Login SIMAD',
      text: `Halo ${user.fullName},\n\nGunakan link berikut untuk login:\n${magicUrl}\n\nAtau gunakan token:\n${token}\n\nToken berlaku satu kali pakai dan kedaluwarsa dalam 24 jam.`,
    });
  }

  // ===== POST /auth/magic-link/verify =====

  public async verifyMagicLink(token: string) {
    if (!token) {
      throw new AppError(400, 'Token is required');
    }

    const decoded = this.verifyEmailToken(token, 'magic-link');

    const user = await this.findLoginUser(decoded.id);
    if (!user || user.deletedAt) {
      throw new AppError(401, 'Account not found');
    }
    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated');
    }
    if (!user.emailVerified) {
      throw new AppError(403, 'Email not verified');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    const accessToken = signAccessToken(payload);
    const { refreshToken } = await this.createSession(user.id, payload);

    return { accessToken, refreshToken };
  }

  // ===== POST /auth/forgot-password =====

  public async forgotPassword(email: string) {
    const normalized = email?.toLowerCase().trim();
    if (!normalized) {
      throw new AppError(400, 'Email is required');
    }

    // Anti user enumeration: selalu sukses, link hanya dikirim bila akun valid.
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (user && !user.deletedAt && user.isActive && user.emailVerified && user.password) {
      const token = signEmailToken(
        { id: user.id, email: user.email, fullName: user.fullName },
        'reset-password',
      );
      const resetUrl = buildFrontendUrl(`/auth/reset-password?token=${encodeURIComponent(token)}`);
      await sendEmail({
        to: user.email,
        subject: 'Reset Password SIMAD',
        text: `Halo ${user.fullName},\n\nReset password kamu melalui link berikut:\n${resetUrl}\n\nAtau gunakan token:\n${token}\n\nToken berlaku 24 jam.`,
      });
    }
  }

  // ===== POST /auth/reset-password =====

  public async resetPassword(token: string, password: string) {
    if (!token || !password) {
      throw new AppError(400, 'Token and password are required');
    }

    const policyError = validatePasswordPolicy(password);
    if (policyError) {
      throw new AppError(400, policyError);
    }

    const decoded = this.verifyEmailToken(token, 'reset-password');

    const user = await this.findActiveUserById(decoded.id);

    const hashedPassword = await bcryptjs.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // ===== POST /auth/refresh-token =====

  public async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError(400, 'refreshToken is required');
    }

    let decoded: ReturnType<typeof verifyJwtToken>;
    try {
      decoded = verifyJwtToken(refreshToken);
    } catch {
      throw new AppError(401, 'Refresh token is invalid or expired');
    }

    const stored = await prisma.refreshToken.findFirst({
      where: { token: refreshToken },
    });

    if (!stored || stored.revokedAt) {
      throw new AppError(401, 'Refresh token has been revoked');
    }
    if (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) {
      throw new AppError(401, 'Refresh token has expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: stored.userId ?? decoded.id },
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError(401, 'Account is not available');
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return { accessToken, expiresIn: ACCESS_TOKEN_TTL };
  }

  // ===== POST /auth/logout =====

  public async logout(userId: string, refreshToken?: string | null) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  // ===== POST /auth/logout-all =====

  public async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ===== GET /auth/me =====

  public me(user: AuthUser) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.roles[0] ?? DEFAULT_ROLE_CODE,
    };
  }

  // ===== PATCH /auth/change-password =====

  public async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'currentPassword and newPassword are required');
    }

    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) {
      throw new AppError(400, policyError);
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !dbUser.password) {
      throw new AppError(404, 'Account not found');
    }

    const validPassword = await bcryptjs.compare(currentPassword, dbUser.password);
    if (!validPassword) {
      throw new AppError(400, 'Current password is incorrect');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // ===== PATCH /auth/change-email =====

  public async changeEmail(userId: string, newEmail: string, password: string) {
    const normalized = newEmail?.toLowerCase().trim();
    if (!normalized || !password) {
      throw new AppError(400, 'newEmail and password are required');
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !dbUser.password) {
      throw new AppError(404, 'Account not found');
    }

    const validPassword = await bcryptjs.compare(password, dbUser.password);
    if (!validPassword) {
      throw new AppError(400, 'Password is incorrect');
    }

    if (normalized === dbUser.email) {
      throw new AppError(400, 'New email is the same as current email');
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    const token = signEmailToken(
      { id: dbUser.id, email: dbUser.email, fullName: dbUser.fullName },
      'change-email',
      { newEmail: normalized },
    );
    const verifyUrl = buildFrontendUrl(
      `/auth/change-email/verify?token=${encodeURIComponent(token)}`,
    );
    await sendEmail({
      to: normalized,
      subject: 'Konfirmasi Perubahan Email SIMAD',
      text: `Halo ${dbUser.fullName},\n\nKonfirmasi perubahan email kamu menjadi ${normalized} melalui link berikut:\n${verifyUrl}\n\nAtau gunakan token:\n${token}\n\nToken berlaku 24 jam.`,
    });
  }

  // ===== POST /auth/change-email/verify =====

  public async changeEmailVerify(userId: string, token: string) {
    if (!token) {
      throw new AppError(400, 'Token is required');
    }

    const decoded = this.verifyEmailToken(token, 'change-email');
    if (decoded.id !== userId) {
      throw new AppError(400, 'Token is invalid or expired');
    }

    const newEmail = decoded.newEmail?.toLowerCase().trim();
    if (!newEmail) {
      throw new AppError(400, 'Token is invalid or expired');
    }

    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existing && existing.id !== userId) {
      throw new AppError(400, 'Email already registered');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          email: newEmail,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // ===== GET /auth/sessions =====

  public async sessions(userId: string, currentToken: string | null) {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, expiresAt: true, token: true },
    });

    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: Boolean(currentToken && session.token === currentToken),
    }));
  }

  // ===== DELETE /auth/sessions/:sessionId =====

  public async deleteSession(userId: string, sessionId: string) {
    if (!sessionId) {
      throw new AppError(400, 'sessionId is required');
    }

    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    await prisma.refreshToken.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
  }
}

export default new AuthService();

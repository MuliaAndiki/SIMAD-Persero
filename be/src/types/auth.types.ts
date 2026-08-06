/**
 * Payload yang disimpan di dalam JWT Access Token.
 * Catatan: User model pada skema baru TIDAK memiliki field `role` / `token`.
 * Role diambil melalui tabel join `UserRole` dan dilampirkan oleh middleware
 * sebagai `AuthUser.roles` (array kode role).
 */
export interface JwtPayload {
  id: string;
  email: string;
  fullName: string;
}

/**
 * User context yang dilampirkan middleware `verifyToken` ke `c.user`.
 */
export interface AuthUser extends JwtPayload {
  roles: string[];
  emailVerified: boolean;
  isActive: boolean;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface TokenBody {
  token: string;
}

export interface EmailBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailBody {
  newEmail: string;
  password: string;
}

export interface ChangeEmailVerifyBody {
  token: string;
}

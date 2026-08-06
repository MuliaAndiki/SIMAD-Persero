import type { AppContext } from '@/contex';
import { HttpResponse } from '@/http';
import type { AuthUser } from '@/types/auth.types';
import { verifyJwtToken } from '@/utils/auth.util';
import prisma from '../../prisma/client';

/**
 * Middleware autentikasi. Memvalidasi Bearer Token (Access Token JWT),
 * memuat user dari database beserta role-nya (via tabel join UserRole),
 * kemudian melampirkan `AuthUser` ke `c.user`.
 *
 * Semua respons (sukses/gagal) menggunakan helper resmi `HttpResponse`
 * dari `@/http` agar format envelope konsisten.
 */
export const verifyToken = () => ({
  async beforeHandle(c: AppContext) {
    try {
      const authHeader = c.request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        return HttpResponse(c).unauthorized('Access denied. No token provided.');
      }

      const decoded = verifyJwtToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { userRoles: { include: { role: true } } },
      });

      if (!user || user.deletedAt) {
        return HttpResponse(c).unauthorized('Account not found.');
      }

      if (!user.isActive) {
        return HttpResponse(c).forbidden('Account is deactivated.');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        roles: user.userRoles.map((ur) => ur.role.code),
      };

      c.user = authUser;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        return HttpResponse(c).unauthorized('Token has expired.');
      }
      if (error?.name === 'JsonWebTokenError') {
        return HttpResponse(c).forbidden('Invalid token.');
      }
      console.error('JWT verification error:', error);
      return HttpResponse(c).internalError();
    }
  },
});

/**
 * Middleware otorisasi. Memeriksa apakah user memiliki minimal satu role
 * dari daftar yang diizinkan. Role dicek terhadap `c.user.roles`
 * (kode role, bukan id) yang sudah dilampirkan oleh `verifyToken`.
 */
export const requireRole = (roles: string[]) => ({
  beforeHandle: (c: AppContext) => {
    const user = c.user;
    if (!user || !roles.some((role) => user.roles?.includes(role))) {
      return HttpResponse(c).forbidden('Access denied. Insufficient role.');
    }
  },
});

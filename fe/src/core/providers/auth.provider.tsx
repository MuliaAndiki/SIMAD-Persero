'use client';

import { setAuthErrorHandler } from '@/api/client/client-http';
import { clearSessionCookies, getAccessToken, getRefreshToken } from '@/utils/session-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type React from 'react';

/** Halaman publik yang tidak membutuhkan sesi aktif. */
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/verify-email',
  '/magic-link',
  '/auth/magic-link',
  '/home',
];

/**
 * AuthProvider — lapisan autentikasi klien SIMAD.
 *
 * 1. Mendaftarkan `authErrorHandler` ke client-http:
 *    saat API privat mengembalikan 401 (dan refresh gagal), seluruh cookie
 *    sesi dibersihkan lalu user diarahkan ke /login.
 * 2. Guard ringan saat navigasi SPA: tanpa access/refresh token di area
 *    privat → redirect ke /login. Guard server tetap di (private)/layout.tsx.
 *
 * Token disimpan di cookie (`simad_session`, `simad_refres`, `simad_role`)
 * oleh utils/session-cookie — lihat auth flow di mutate.ts.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 401 (access token invalid/expired & refresh gagal) → bersihkan + ke /login.
  useEffect(() => {
    const handleAuthError = () => {
      clearSessionCookies();
      if (!pathname?.startsWith('/login')) {
        window.location.assign('/login');
      }
    };

    setAuthErrorHandler(handleAuthError);
    return () => setAuthErrorHandler(null);
  }, [pathname]);

  // Guard klien: redirect bila tidak ada access/refresh token di area privat.
  // Jika hanya refresh token yang tersisa, biarkan berjalan — client-http akan
  // memanggil POST /auth/refresh-token untuk memperbarui access token.
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
    const hasSession = Boolean(getAccessToken() || getRefreshToken());

    if (!isPublicPath && !hasSession) {
      router.replace('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}

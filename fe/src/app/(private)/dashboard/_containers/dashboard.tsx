'use client';

import { getRoleDashboardPath } from '@/configs/app.config';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Halaman `/dashboard` — dispatcher berbasis role.
 *
 * Setelah role akun diketahui (GET /auth/me), pengguna diarahkan ke dashboard
 * sesuai role-nya: /intern/dashboard, /hr_admin/dashboard, atau
 * /supervisor/dashboard. Halaman khusus role dibuat di folder role masing-masing
 * (scalable — tiap role bisa punya halaman yang tidak dimiliki role lain).
 */
export default function DashboardDispatcher() {
  const api = useApi();
  const router = useRouter();

  const me = api.auth.query.me();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current || me.isPending || !me.data?.role) return;

    const target = getRoleDashboardPath(me.data.role);
    if (target !== '/dashboard') {
      didRedirect.current = true;
      router.replace(target);
    }
  }, [me.isPending, me.data?.role, router]);

  if (me.isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Gagal memuat data akun. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Mengalihkan ke dashboard Anda…</p>
    </div>
  );
}

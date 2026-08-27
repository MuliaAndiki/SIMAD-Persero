'use client';

import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { useInternAccess } from '@/hooks/useInternAccess';
import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';

/**
 * InternAccessGate — pelindung halaman yang hanya boleh diakses setelah
 * pengajuan magang disetujui (internship aktif).
 *
 * Dipakai di modul Absensi & Riwayat: bila `GET /dashboard/intern` mengembalikan
 * `internship: null`, konten diganti dengan kartu informasi + CTA ke menu
 * Pengajuan sehingga akses langsung via URL juga diamankan.
 */
export function InternAccessGate({ children }: { children: React.ReactNode }) {
  const { hasActiveInternship, isChecking } = useInternAccess();

  if (isChecking) {
    return (
      <section className="flex flex-col gap-6" aria-busy="true">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Memuat…</h1>
          <p className="text-sm text-muted-foreground">Memeriksa status pengajuan magang Anda.</p>
        </header>
      </section>
    );
  }

  if (!hasActiveInternship) {
    return (
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Akses Terbatas</h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini hanya dapat diakses setelah pengajuan magang Anda disetujui.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-primary" />
              Belum Ada Magang Aktif
            </CardTitle>
            <CardDescription>
              Modul Absensi & Riwayat baru aktif setelah magang Anda disetujui HR.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
              Anda belum memiliki pengajuan magang yang disetujui. Silakan ajukan magang terlebih
              dahulu melalui menu Pengajuan.
            </p>
            <Button asChild size="sm">
              <Link href="/INTERN/application">Ajukan Magang</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return <>{children}</>;
}

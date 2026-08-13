'use client';

import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Card } from '@/components/atoms/card';

/**
 * Fallback skeleton untuk halaman detail pengajuan (dynamic route `[id]`).
 * Ditampilkan oleh `<Suspense>` pada server component saat streaming konten
 * halaman, memakai PhantomSkeleton dari @aejkatappaja/phantom-ui.
 */
export function ApplicationDetailFallback() {
  return (
    <PhantomSkeleton loading>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <div className="h-8 w-36 rounded-lg bg-muted" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-52 rounded-lg bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
        </header>
        <Card className="h-80" />
      </div>
    </PhantomSkeleton>
  );
}

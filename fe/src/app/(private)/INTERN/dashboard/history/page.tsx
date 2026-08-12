import { InternAccessGate } from '@/components/page/intern/InternAccessGate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Riwayat - SIMAD',
  description: 'Riwayat aktivitas magang peserta magang PLN Persero',
};

export default function InternHistoryPage() {
  return (
    <InternAccessGate>
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Riwayat</h1>
          <p className="text-sm text-muted-foreground">
            Lihat riwayat aktivitas magang Anda. Fitur ini sedang disiapkan.
          </p>
        </header>
      </section>
    </InternAccessGate>
  );
}

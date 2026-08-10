import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil - SIMAD',
  description: 'Profil peserta magang PLN Persero',
};

export default function InternProfilePage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data profil Anda. Fitur ini sedang disiapkan.
        </p>
      </header>
    </section>
  );
}

import type { Metadata } from 'next';
import MagicLinkContainer from './_containers/magic-link';

export const metadata: Metadata = {
  title: 'Masuk via Tautan Ajaib - SIMAD',
  description:
    'Masuk ke Sistem Informasi Manajemen Magang & Absensi Digital menggunakan tautan ajaib',
};

export default function MagicLinkPage() {
  return <MagicLinkContainer />;
}

import type { Metadata } from 'next';
import MagicLinkContainer from './_containers/magic-link';

export const metadata: Metadata = {
  title: 'Masuk via Magic Link - SIMAD',
  description:
    'Masuk ke Sistem Informasi Manajemen Magang & Absensi Digital menggunakan magic link',
};

export default function MagicLinkPage() {
  return <MagicLinkContainer />;
}

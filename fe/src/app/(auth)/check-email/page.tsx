import type { Metadata } from 'next';
import CheckEmailContainer from './_containers/check-email';

export const metadata: Metadata = {
  title: 'Periksa Surel - SIMAD',
  description: 'Verifikasi surel akun Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function CheckEmailPage() {
  return <CheckEmailContainer />;
}

import type { Metadata } from 'next';
import CheckEmailContainer from './_containers/check-email';

export const metadata: Metadata = {
  title: 'Periksa Email - SIMAD',
  description: 'Verifikasi email akun Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function CheckEmailPage() {
  return <CheckEmailContainer />;
}

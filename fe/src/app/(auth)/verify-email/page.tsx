import type { Metadata } from 'next';
import VerifyEmailContainer from './_containers/verify-email';

export const metadata: Metadata = {
  title: 'Verifikasi Email - SIMAD',
  description: 'Verifikasi email akun Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function VerifyEmailPage() {
  return <VerifyEmailContainer />;
}

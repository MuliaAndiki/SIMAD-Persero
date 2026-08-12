import type { Metadata } from 'next';
import RegisterContainer from './_containers/register';

export const metadata: Metadata = {
  title: 'Register - SIMAD',
  description: 'Mendaftar ke Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function RegisterPage() {
  return <RegisterContainer />;
}

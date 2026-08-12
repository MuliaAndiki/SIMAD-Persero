import type { Metadata } from 'next';
import LoginContainer from './_containers/login';

export const metadata: Metadata = {
  title: 'Login - SIMAD',
  description: 'Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function LoginPage() {
  return <LoginContainer />;
}

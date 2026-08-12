import type { Metadata } from 'next';
import ForgotPasswordContainer from './_containers/forgot-password';

export const metadata: Metadata = {
  title: 'Lupa Password - SIMAD',
  description: 'Reset password Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContainer />;
}

import type { Metadata } from 'next';
import ForgotPasswordContainer from './_containers/forgot-password';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi - SIMAD',
  description: 'Atur ulang kata sandi Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContainer />;
}

import type { Metadata } from 'next';
import ResetPasswordContainer from './_containers/reset-password';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi - SIMAD',
  description: 'Atur ulang kata sandi Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function ResetPasswordPage() {
  return <ResetPasswordContainer />;
}

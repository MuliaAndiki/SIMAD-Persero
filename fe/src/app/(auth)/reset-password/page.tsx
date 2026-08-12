import type { Metadata } from 'next';
import ResetPasswordContainer from './_containers/reset-password';

export const metadata: Metadata = {
  title: 'Reset Password - SIMAD',
  description: 'Atur ulang password Sistem Informasi Manajemen Magang & Absensi Digital',
};

export default function ResetPasswordPage() {
  return <ResetPasswordContainer />;
}

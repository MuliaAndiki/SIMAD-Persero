import type { Metadata } from 'next';
import ChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ganti Kata Sandi - SIMAD',
  description: 'Ubah kata sandi akun peserta magang PLN Persero',
};

export default function ChangePasswordPage() {
  return <ChangePasswordContainer />;
}

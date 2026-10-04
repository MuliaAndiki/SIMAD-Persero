import type { Metadata } from 'next';
import HrChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ganti Kata Sandi - SIMAD',
  description: 'Ganti kata sandi akun Admin HR PLN Persero',
};

export default function HrChangePasswordPage() {
  return <HrChangePasswordContainer />;
}

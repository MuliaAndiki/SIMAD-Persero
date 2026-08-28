import type { Metadata } from 'next';
import HrChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ganti Password - SIMAD',
  description: 'Ganti password akun HR Admin PLN Persero',
};

export default function HrChangePasswordPage() {
  return <HrChangePasswordContainer />;
}

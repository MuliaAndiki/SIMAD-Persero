import type { Metadata } from 'next';
import SupervisorChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ganti Kata Sandi - SIMAD',
  description: 'Ganti kata sandi akun Mentor PLN Persero',
};

export default function SupervisorChangePasswordPage() {
  return <SupervisorChangePasswordContainer />;
}

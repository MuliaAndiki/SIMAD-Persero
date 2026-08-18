import type { Metadata } from 'next';
import SupervisorChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ganti Password - SIMAD',
  description: 'Ganti password akun HR Admin PLN Persero',
};

export default function SupervisorChangePasswordPage() {
  return <SupervisorChangePasswordContainer />;
}

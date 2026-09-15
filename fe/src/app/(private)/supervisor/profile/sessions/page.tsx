import SessionsContainer from '@/components/page/profile/SessionsContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perangkat & Sesi Aktif - SIMAD',
  description: 'Kelola sesi login aktif akun Supervisor PLN Persero',
};

export default function SupervisorSessionsPage() {
  return <SessionsContainer />;
}

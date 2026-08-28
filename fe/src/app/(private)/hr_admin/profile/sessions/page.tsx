import type { Metadata } from 'next';
import SessionsContainer from '@/components/page/profile/SessionsContainer';

export const metadata: Metadata = {
  title: 'Perangkat & Sesi Aktif - SIMAD',
  description: 'Kelola sesi login aktif akun HR Admin PLN Persero',
};

export default function HrAdminSessionsPage() {
  return <SessionsContainer />;
}

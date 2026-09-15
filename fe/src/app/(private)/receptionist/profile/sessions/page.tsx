import SessionsContainer from '@/components/page/profile/SessionsContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perangkat & Sesi Aktif - SIMAD',
  description: 'Kelola sesi login aktif akun Resepsionis PLN Persero',
};

export default function ReceptionistSessionsPage() {
  return <SessionsContainer />;
}

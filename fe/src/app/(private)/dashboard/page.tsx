import type { Metadata } from 'next';
import DashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard - SIMAD',
  description: 'Ringkasan aktivitas magang & absensi digital PLN Persero',
};

export default function DashboardPage() {
  return <DashboardContainer />;
}

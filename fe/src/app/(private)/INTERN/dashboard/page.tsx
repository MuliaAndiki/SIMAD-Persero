import type { Metadata } from 'next';
import InternDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Intern - SIMAD',
  description: 'Ringkasan magang & absensi digital peserta magang PLN Persero',
};

export default function InternDashboardPage() {
  return <InternDashboardContainer />;
}

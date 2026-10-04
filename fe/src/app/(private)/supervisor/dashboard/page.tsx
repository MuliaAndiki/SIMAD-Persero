import type { Metadata } from 'next';
import SupervisorDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dasbor Mentor - SIMAD',
  description: 'Ringkasan pemantauan peserta magang & absensi digital PLN Persero',
};

export default function SupervisorDashboardPage() {
  return <SupervisorDashboardContainer />;
}

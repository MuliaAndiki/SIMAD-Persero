import type { Metadata } from 'next';
import SupervisorDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Supervisor - SIMAD',
  description: 'Ringkasan monitoring peserta magang & absensi digital PLN Persero',
};

export default function SupervisorDashboardPage() {
  return <SupervisorDashboardContainer />;
}

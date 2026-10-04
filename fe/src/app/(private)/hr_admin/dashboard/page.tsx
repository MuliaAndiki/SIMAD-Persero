import type { Metadata } from 'next';
import HrDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dasbor HR - SIMAD',
  description: 'Ringkasan pengelolaan magang & absensi digital PLN Persero',
};

export default function HrDashboardPage() {
  return <HrDashboardContainer />;
}

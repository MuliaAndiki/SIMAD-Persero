import type { Metadata } from 'next';
import ReceptionistDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Resepsionis - SIMAD',
  description: 'Dashboard Resepsionis PLN Persero untuk memantau kedatangan & absensi intern.',
};

export default function ReceptionistDashboardPage() {
  return <ReceptionistDashboardContainer />;
}

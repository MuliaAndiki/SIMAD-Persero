import type { Metadata } from 'next';
import ReceptionistDashboardContainer from './_containers/dashboard';

export const metadata: Metadata = {
  title: 'Dasbor Resepsionis - SIMAD',
  description: 'Dasbor Resepsionis PLN Persero untuk memantau kedatangan & absensi magang.',
};

export default function ReceptionistDashboardPage() {
  return <ReceptionistDashboardContainer />;
}

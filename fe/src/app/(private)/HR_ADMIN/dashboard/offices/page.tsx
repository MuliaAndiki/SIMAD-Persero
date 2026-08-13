import type { Metadata } from 'next';
import HrOfficesContainer from './_containers/offices';

export const metadata: Metadata = {
  title: 'Kantor - SIMAD',
  description: 'Kelola lokasi kantor dan titik koordinat absensi',
};

export default function HrOfficesPage() {
  return <HrOfficesContainer />;
}

import type { Metadata } from 'next';
import HrUniversitiesContainer from './_containers/universities';

export const metadata: Metadata = {
  title: 'Universitas & Perguruan Tinggi | HR Admin SIMAD',
  description: 'Kelola master data perguruan tinggi / institusi asal peserta magang.',
};

export default function HrUniversitiesPage() {
  return <HrUniversitiesContainer />;
}

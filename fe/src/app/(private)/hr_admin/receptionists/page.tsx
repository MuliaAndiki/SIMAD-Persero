import type { Metadata } from 'next';
import HrReceptionistsContainer from './_containers/receptionists';

export const metadata: Metadata = {
  title: 'Resepsionis - SIMAD',
  description: 'Kelola akun petugas resepsionis di masing-masing kantor',
};

export default function HrReceptionistsPage() {
  return <HrReceptionistsContainer />;
}

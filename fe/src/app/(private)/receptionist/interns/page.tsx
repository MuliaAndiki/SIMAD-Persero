import type { Metadata } from 'next';
import { ReceptionistInternsContainer } from './_containers/ReceptionistInternsContainer';

export const metadata: Metadata = {
  title: 'Intern Aktif - Resepsionis - SIMAD',
  description: 'Daftar peserta magang yang sedang aktif dan informasi penempatannya.',
};

export default function ReceptionistInternsPage() {
  return <ReceptionistInternsContainer />;
}

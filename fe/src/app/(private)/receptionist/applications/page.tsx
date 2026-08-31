import type { Metadata } from 'next';
import { ReceptionistApplicationsContainer } from './_containers/ReceptionistApplicationsContainer';

export const metadata: Metadata = {
  title: 'Pengajuan Magang - Resepsionis - SIMAD',
  description: 'Daftar pengajuan magang untuk membantu verifikasi dan informasi bagi calon peserta.',
};

export default function ReceptionistApplicationsPage() {
  return <ReceptionistApplicationsContainer />;
}

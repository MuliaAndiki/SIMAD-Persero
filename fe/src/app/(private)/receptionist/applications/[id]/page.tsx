import type { Metadata } from 'next';
import { ReceptionistApplicationDetailContainer } from './_containers/ReceptionistApplicationDetailContainer';

export const metadata: Metadata = {
  title: 'Detail Pengajuan - Resepsionis - SIMAD',
  description: 'Detail pengajuan magang peserta.',
};

export default function ReceptionistApplicationDetailPage({ params }: { params: { id: string } }) {
  return <ReceptionistApplicationDetailContainer applicationId={params.id} />;
}

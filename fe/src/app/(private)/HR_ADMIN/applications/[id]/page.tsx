import type { Metadata } from 'next';
import HrApplicationDetailContainer from './_containers/applications-detail';

export const metadata: Metadata = {
  title: 'Detail Pengajuan Magang - SIMAD',
  description: 'Review dan kelola detail pengajuan magang peserta',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HrApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <HrApplicationDetailContainer id={id} />;
}

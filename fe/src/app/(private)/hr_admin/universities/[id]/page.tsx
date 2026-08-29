import type { Metadata } from 'next';
import UniversityDetailContainer from './_containers/university-detail';

export const metadata: Metadata = {
  title: 'Detail Universitas - SIMAD',
  description: 'Detail informasi dan pengelola data perguruan tinggi / institusi',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HrUniversityDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <UniversityDetailContainer id={id} />;
}

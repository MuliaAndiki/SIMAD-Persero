import type { Metadata } from 'next';
import { Suspense } from 'react';
import SupervisorDetailContainer from './_containers/supervisor-detail';

export const metadata: Metadata = {
  title: 'Detail Mentor - SIMAD',
  description: 'Detail bimbingan mentor magang',
};

type HrSupervisorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HrSupervisorDetailPage({ params }: HrSupervisorDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-8">Memuat detail mentor...</div>}>
      <SupervisorDetailContainer supervisorId={id} />
    </Suspense>
  );
}

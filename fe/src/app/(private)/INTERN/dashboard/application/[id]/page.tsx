import { ApplicationDetailFallback } from '@/components/organisms/application/ApplicationDetailFallback';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ApplicationDetailContainer from './_containers/application-detail';

export const metadata: Metadata = {
  title: 'Detail Pengajuan - SIMAD',
  description: 'Detail pengajuan magang PLN Persero',
};

type InternApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternApplicationDetailPage({
  params,
}: InternApplicationDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ApplicationDetailFallback />}>
      <ApplicationDetailContainer applicationId={id} />
    </Suspense>
  );
}

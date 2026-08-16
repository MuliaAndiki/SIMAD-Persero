import type { Metadata } from 'next';
import ApplicationContainer from './_containers/application';

export const metadata: Metadata = {
  title: 'Pengajuan Magang - SIMAD',
  description: 'Pengajuan surat magang PLN Persero',
};

export default function InternApplicationPage() {
  return <ApplicationContainer />;
}

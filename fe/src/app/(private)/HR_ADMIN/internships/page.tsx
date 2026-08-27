import type { Metadata } from 'next';
import HrInternshipsContainer from './_containers/internships';

export const metadata: Metadata = {
  title: 'Magang - SIMAD',
  description: 'Pantau status magang peserta dan mulai magang yang siap aktif',
};

export default function HrInternshipsPage() {
  return <HrInternshipsContainer />;
}

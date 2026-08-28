import type { Metadata } from 'next';
import InternsContainer from './_containers/interns';

export const metadata: Metadata = {
  title: 'Peserta Bimbingan - SIMAD',
  description:
    'Daftar peserta magang yang ditugaskan kepada supervisor beserta status absensi harian',
};

export default function InternsPage() {
  return <InternsContainer />;
}

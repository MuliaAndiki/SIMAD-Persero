import type { Metadata } from 'next';
import HrApplicationsContainer from './_containers/applications';

export const metadata: Metadata = {
  title: 'Pengajuan Magang - SIMAD',
  description: 'Review dan kelola pengajuan magang peserta',
};

export default function HrApplicationsPage() {
  return <HrApplicationsContainer />;
}

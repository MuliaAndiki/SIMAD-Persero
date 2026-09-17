import type { Metadata } from 'next';
import SupervisorInternDetailContainer from './_containers/intern-detail';

export const metadata: Metadata = {
  title: 'Detail Peserta Magang - SIMAD',
  description: 'Profil lengkap dan informasi magang peserta bimbingan supervisor',
};

export default function SupervisorInternDetailPage() {
  return <SupervisorInternDetailContainer />;
}

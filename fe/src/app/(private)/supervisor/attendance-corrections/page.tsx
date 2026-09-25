import type { Metadata } from 'next';
import SupervisorCorrectionsContainer from './_containers/corrections';

export const metadata: Metadata = {
  title: 'Koreksi Absensi - SIMAD',
  description: 'Tinjau dan setujui permohonan koreksi jam absensi peserta magang',
};

export default function SupervisorCorrectionsPage() {
  return <SupervisorCorrectionsContainer />;
}

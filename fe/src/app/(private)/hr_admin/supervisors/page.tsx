import type { Metadata } from 'next';
import HrSupervisorsContainer from './_containers/supervisors';

export const metadata: Metadata = {
  title: 'Supervisor - SIMAD',
  description: 'Kelola supervisor pembimbing dan penugasan peserta magang',
};

export default function HrSupervisorsPage() {
  return <HrSupervisorsContainer />;
}

import type { Metadata } from 'next';
import HrSupervisorsContainer from './_containers/supervisors';

export const metadata: Metadata = {
  title: 'Mentor - SIMAD',
  description: 'Kelola mentor pembimbing dan penugasan peserta magang',
};

export default function HrSupervisorsPage() {
  return <HrSupervisorsContainer />;
}

import type { Metadata } from 'next';
import SupervisorProfileContainer from './_containers/profile';

export const metadata: Metadata = {
  title: 'Profil - SIMAD',
  description: 'Profil Supervisor PLN Persero',
};

export default function SupervisorAdminProfilePage() {
  return <SupervisorProfileContainer />;
}

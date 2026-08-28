import type { Metadata } from 'next';
import HrProfileContainer from './_containers/profile';

export const metadata: Metadata = {
  title: 'Profil - SIMAD',
  description: 'Profil HR Admin PLN Persero',
};

export default function HrAdminProfilePage() {
  return <HrProfileContainer />;
}

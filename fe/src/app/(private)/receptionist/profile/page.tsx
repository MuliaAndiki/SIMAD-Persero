import type { Metadata } from 'next';
import ReceptionistProfileContainer from './_containers/profile';

export const metadata: Metadata = {
  title: 'Profil - SIMAD',
  description: 'Profil Resepsionis PLN Persero',
};

export default function ReceptionistProfilePage() {
  return <ReceptionistProfileContainer />;
}

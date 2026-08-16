import type { Metadata } from 'next';
import ProfileContainer from './_containers/profile';

export const metadata: Metadata = {
  title: 'Profil - SIMAD',
  description: 'Profil peserta magang PLN Persero',
};

export default function InternProfilePage() {
  return <ProfileContainer />;
}

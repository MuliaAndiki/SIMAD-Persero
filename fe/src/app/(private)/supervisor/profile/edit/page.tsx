import type { Metadata } from 'next';
import SupervisorEditProfileContainer from './_container/edit-profile';

export const metadata: Metadata = {
  title: 'Ubah Profil - SIMAD',
  description: 'Perbarui data profil Supervisor PLN Persero',
};

export default function SupervisorEditProfilePage() {
  return <SupervisorEditProfileContainer />;
}

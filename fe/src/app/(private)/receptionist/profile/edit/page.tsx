import type { Metadata } from 'next';
import ReceptionistEditProfileContainer from './_container/edit-profile';

export const metadata: Metadata = {
  title: 'Ubah Profil - SIMAD',
  description: 'Ubah Profil Resepsionis SIMAD',
};

export default function ReceptionistEditProfilePage() {
  return <ReceptionistEditProfileContainer />;
}

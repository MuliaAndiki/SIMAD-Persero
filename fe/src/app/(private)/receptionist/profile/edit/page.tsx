import type { Metadata } from 'next';
import ReceptionistEditProfileContainer from './_container/edit-profile';

export const metadata: Metadata = {
  title: 'Edit Profil - SIMAD',
  description: 'Edit Profil Resepsionis SIMAD',
};

export default function ReceptionistEditProfilePage() {
  return <ReceptionistEditProfileContainer />;
}

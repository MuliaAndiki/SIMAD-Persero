import type { Metadata } from 'next';
import HrEditProfileContainer from './_container/edit-profile';

export const metadata: Metadata = {
  title: 'Ubah Profil - SIMAD',
  description: 'Perbarui data profil HR Admin PLN Persero',
};

export default function HrEditProfilePage() {
  return <HrEditProfileContainer />;
}

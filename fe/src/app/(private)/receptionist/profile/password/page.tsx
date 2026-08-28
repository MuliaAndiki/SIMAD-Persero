import type { Metadata } from 'next';
import ReceptionistChangePasswordContainer from './_container/change-password';

export const metadata: Metadata = {
  title: 'Ubah Kata Sandi - SIMAD',
  description: 'Ubah Kata Sandi Resepsionis SIMAD',
};

export default function ReceptionistChangePasswordPage() {
  return <ReceptionistChangePasswordContainer />;
}

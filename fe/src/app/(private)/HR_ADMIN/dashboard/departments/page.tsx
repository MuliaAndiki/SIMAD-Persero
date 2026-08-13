import type { Metadata } from 'next';
import HrDepartmentsContainer from './_containers/departments';

export const metadata: Metadata = {
  title: 'Departemen - SIMAD',
  description: 'Kelola departemen tempat peserta magang ditempatkan',
};

export default function HrDepartmentsPage() {
  return <HrDepartmentsContainer />;
}

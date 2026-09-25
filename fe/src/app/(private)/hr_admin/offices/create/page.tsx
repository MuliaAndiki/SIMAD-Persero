import type { Metadata } from 'next';
import CreateOfficeContainer from './_containers/create-office';

export const metadata: Metadata = {
  title: 'Tambah Kantor Baru - SIMAD',
  description: 'Tambah kantor baru dan konfigurasikan titik koordinat serta jam kerja absensi',
};

export default function CreateOfficePage() {
  return <CreateOfficeContainer />;
}

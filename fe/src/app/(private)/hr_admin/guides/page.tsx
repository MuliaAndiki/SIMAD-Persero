import type { Metadata } from 'next';
import HRGuidesContainer from './_containers/guides';

export const metadata: Metadata = {
  title: 'Manajemen Panduan - Admin HR SIMAD',
  description: 'Kelola materi panduan, modul orientasi, dan video tutorial untuk peserta magang',
};

export default function HRGuidesPage() {
  return <HRGuidesContainer />;
}

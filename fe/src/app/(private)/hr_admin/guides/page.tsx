import type { Metadata } from 'next';
import HRGuidesContainer from './_containers/guides';

export const metadata: Metadata = {
  title: 'Manajemen Panduan - HR Admin SIMAD',
  description: 'Kelola materi panduan, modul onboarding, dan video tutorial untuk peserta magang',
};

export default function HRGuidesPage() {
  return <HRGuidesContainer />;
}

import type { Metadata } from 'next';
import CreateGuideContainer from './_containers/create-guide';

export const metadata: Metadata = {
  title: 'Tambah Panduan - Admin HR SIMAD',
  description: 'Buat materi panduan dan video tutorial baru untuk peserta magang',
};

export default function CreateGuidePage() {
  return <CreateGuideContainer />;
}

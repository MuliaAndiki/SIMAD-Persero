import type { Metadata } from 'next';
import EditGuideContainer from './_containers/edit-guide';

export const metadata: Metadata = {
  title: 'Edit Panduan - Admin HR SIMAD',
  description: 'Perbarui materi panduan dan video tutorial peserta magang',
};

export default function EditGuidePage() {
  return <EditGuideContainer />;
}

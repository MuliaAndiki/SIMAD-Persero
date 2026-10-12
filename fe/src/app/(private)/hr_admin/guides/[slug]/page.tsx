import type { Metadata } from 'next';
import HRGuideDetailContainer from './_containers/guide-detail';

export const metadata: Metadata = {
  title: 'Detail Panduan - Admin HR SIMAD',
  description: 'Detail materi panduan dan video tutorial peserta magang',
};

export default function HRGuideDetailPage() {
  return <HRGuideDetailContainer />;
}

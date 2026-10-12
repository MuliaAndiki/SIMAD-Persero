import type { Metadata } from 'next';
import InternGuideDetailContainer from './_containers/guide-detail';

export const metadata: Metadata = {
  title: 'Detail Panduan - SIMAD',
  description: 'Detail materi panduan dan video tutorial magang PLN Persero',
};

export default function InternGuideDetailPage() {
  return <InternGuideDetailContainer />;
}

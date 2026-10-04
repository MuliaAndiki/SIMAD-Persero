import type { Metadata } from 'next';
import InternGuideContainer from './_containers/guide';

export const metadata: Metadata = {
  title: 'Panduan & Tutorial - SIMAD',
  description: 'Pusat panduan, materi orientasi, dan video tutorial magang PLN Persero',
};

export default function InternGuidePage() {
  return <InternGuideContainer />;
}

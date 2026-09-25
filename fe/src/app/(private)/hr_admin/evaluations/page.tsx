import type { Metadata } from 'next';
import HrEvaluationsContainer from './_containers/evaluations';

export const metadata: Metadata = {
  title: 'Penilaian Magang - SIMAD',
  description: 'Rekapitulasi nilai dan evaluasi peserta magang',
};

export default function HrEvaluationsPage() {
  return <HrEvaluationsContainer />;
}

import type { Metadata } from 'next';
import SupervisorEvaluationsContainer from './_containers/evaluations';

export const metadata: Metadata = {
  title: 'Penilaian Magang - SIMAD',
  description: 'Evaluasi dan penilaian kompetensi peserta magang oleh supervisor',
};

export default function SupervisorEvaluationsPage() {
  return <SupervisorEvaluationsContainer />;
}

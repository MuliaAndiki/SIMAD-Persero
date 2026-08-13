import type { Metadata } from 'next';
import HrReportsContainer from './_containers/reports';

export const metadata: Metadata = {
  title: 'Laporan - SIMAD',
  description: 'Rekap absensi, peserta magang, sertifikat, dan ringkasan sistem',
};

export default function HrReportsPage() {
  return <HrReportsContainer />;
}

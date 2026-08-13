import type { Metadata } from 'next';
import AttendanceDetailContainer from './_containers/attendance-detail';

export const metadata: Metadata = {
  title: 'Detail Absensi - SIMAD',
  description: 'Detail absensi peserta magang beserta riwayat log, override, dan pelanggaran',
};

export default function AttendanceDetailPage() {
  return <AttendanceDetailContainer />;
}

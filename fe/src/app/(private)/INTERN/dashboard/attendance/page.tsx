import type { Metadata } from 'next';
import AttendanceContainer from './_containers/attendance';

export const metadata: Metadata = {
  title: 'Absensi - SIMAD',
  description: 'Absensi digital peserta magang PLN Persero',
};

export default function AttendancePage() {
  return <AttendanceContainer />;
}

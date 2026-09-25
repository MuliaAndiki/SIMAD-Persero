import type { Metadata } from 'next';
import OfficeDetailContainer from './_containers/office-detail';

export const metadata: Metadata = {
  title: 'Detail Kantor & Jadwal Absensi - SIMAD',
  description: 'Detail lengkap lokasi kantor, titik geofence, departemen, dan aturan jam presensi',
};

export default function OfficeDetailPage() {
  return <OfficeDetailContainer />;
}

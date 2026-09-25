import type { Metadata } from 'next';
import EditOfficeContainer from './_containers/edit-office';

export const metadata: Metadata = {
  title: 'Ubah Kantor & Jadwal Absensi - SIMAD',
  description: 'Ubah data lokasi kantor, geofence, departemen, dan pengaturan waktu presensi',
};

export default function EditOfficePage() {
  return <EditOfficeContainer />;
}

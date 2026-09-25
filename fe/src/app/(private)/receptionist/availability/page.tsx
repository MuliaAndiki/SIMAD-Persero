import type { Metadata } from 'next';
import ReceptionistAvailabilityContainer from './_containers/availability';

export const metadata: Metadata = {
  title: 'Cek Ketersediaan Slot - SIMAD',
  description: 'Pengecekan kuota dan slot ketersediaan magang per kantor & departemen',
};

export default function ReceptionistAvailabilityPage() {
  return <ReceptionistAvailabilityContainer />;
}

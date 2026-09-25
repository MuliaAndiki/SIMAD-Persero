import type { Metadata } from 'next';
import EditQuotaContainer from './_containers/edit-quota';

export const metadata: Metadata = {
  title: 'Edit Kuota Kantor | SIMAD PLN',
  description: 'Ubah kapasitas master kuota kantor dan pembagian alokasi departemen',
};

export default function EditQuotaPage() {
  return <EditQuotaContainer />;
}

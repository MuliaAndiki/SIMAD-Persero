import type { Metadata } from 'next';
import CreateQuotaContainer from './_containers/create-quota';

export const metadata: Metadata = {
  title: 'Tambah Kuota Kantor | SIMAD PLN',
  description: 'Tambah konfigurasi master kuota kantor dan alokasi departemen baru',
};

export default function CreateQuotaPage() {
  return <CreateQuotaContainer />;
}

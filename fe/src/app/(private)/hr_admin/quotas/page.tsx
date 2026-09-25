import type { Metadata } from 'next';
import HrQuotasContainer from './_containers/quotas';

export const metadata: Metadata = {
  title: 'Alokasi Kuota Magang - SIMAD',
  description: 'Kelola alokasi dan kapasitas kuota magang per kantor dan divisi PLN',
};

export default function HrQuotasPage() {
  return <HrQuotasContainer />;
}

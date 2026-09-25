import type { Metadata } from 'next';
import QuotaDetailContainer from './_containers/quota-detail';

export const metadata: Metadata = {
  title: 'Detail Kuota Kantor | SIMAD PLN',
  description: 'Detail kapasitas kuota magang dan ketersediaan slot unit kantor PLN',
};

export default function QuotaDetailPage() {
  return <QuotaDetailContainer />;
}

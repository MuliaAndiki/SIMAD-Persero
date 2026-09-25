import type { Metadata } from 'next';
import HrCertificateApprovalContainer from './_containers/approval';

export const metadata: Metadata = {
  title: 'Persetujuan Sertifikat - SIMAD',
  description: 'Persetujuan penerbitan sertifikat magang berdasarkan penilaian supervisor',
};

export default function HrCertificateApprovalPage() {
  return <HrCertificateApprovalContainer />;
}

import type { Metadata } from 'next';
import InternCertificateContainer from './_containers/certificate';

export const metadata: Metadata = {
  title: 'E-Certificate - SIMAD',
  description: 'Unduh E-Certificate magang Anda dari SIMAD',
};

export default function InternCertificatePage() {
  return <InternCertificateContainer />;
}

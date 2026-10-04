import type { Metadata } from 'next';
import InternCertificateContainer from './_containers/certificate';

export const metadata: Metadata = {
  title: 'Sertifikat Elektronik - SIMAD',
  description: 'Unduh Sertifikat Elektronik magang Anda dari SIMAD',
};

export default function InternCertificatePage() {
  return <InternCertificateContainer />;
}

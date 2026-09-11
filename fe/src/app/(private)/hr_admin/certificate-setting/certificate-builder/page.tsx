import type { Metadata } from 'next';
import CertificateBuilderContainer from './_containers/certificate-builder';

export const metadata: Metadata = {
  title: 'Certificate Layout Builder - SIMAD',
  description: 'Atur tata letak posisi elemen teks pada sertifikat magang secara visual',
};

export default function CertificateBuilderPage() {
  return <CertificateBuilderContainer />;
}

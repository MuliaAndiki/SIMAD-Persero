import type { Metadata } from 'next';
import CertificateSettingContainer from './_containers/certificate-setting';

export const metadata: Metadata = {
  title: 'Pengaturan Sertifikat - SIMAD',
  description: 'Pengaturan template dan tanda tangan sertifikat magang',
};

export default function CertificateSettingPage() {
  return <CertificateSettingContainer />;
}

'use client';

import { CertificateDragEditor } from '@/components/organisms/certificate/CertificateDragEditor';
import { useEffect, useState } from 'react';

export default function CertificateBuilderContainer() {
  // Load all saved certificate settings from localStorage (same keys as certificate-setting page)
  const [settings, setSettings] = useState({
    templateUrl: '',
    signatureUrl: '',
    signerName: 'NURLANA',
    signerRole: 'Senior Manager Keuangan, Komunikasi & Umum',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSettings({
        templateUrl: localStorage.getItem('simad_cert_template_url') ?? '',
        signatureUrl: localStorage.getItem('simad_cert_signature_url') ?? '',
        signerName: localStorage.getItem('simad_cert_signer_name') ?? 'NURLANA',
        signerRole:
          localStorage.getItem('simad_cert_signer_role') ??
          'Senior Manager Keuangan, Komunikasi & Umum',
      });
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <CertificateDragEditor
        templateUrl={settings.templateUrl || undefined}
        signatureUrl={settings.signatureUrl || undefined}
        signerName={settings.signerName}
        signerRole={settings.signerRole}
      />
    </div>
  );
}

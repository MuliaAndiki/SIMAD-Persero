'use client';

import { CertificateSettingSection } from '@/components/page/hr_admin/CertificateSettingSection';
import { useApi } from '@/hooks/useService/useApi';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CertificateSettingContainer() {
  const api = useApi();
  const [signerName, setSignerName] = useState('Budi Santoso, S.T., M.T.');
  const [signerRole, setSignerRole] = useState('Manager SDM');
  const uploadFile = api.file.mutate.upload();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('simad_cert_signer_name');
      const savedRole = localStorage.getItem('simad_cert_signer_role');
      if (savedName) setSignerName(savedName);
      if (savedRole) setSignerRole(savedRole);
    }
  }, []);

  const handleSaveSettings = async (data: {
    signerName: string;
    signerRole: string;
    signatureFile?: File;
  }) => {
    try {
      toast.loading('Menyimpan pengaturan sertifikat...', {
        id: 'save-cert-setting',
      });

      if (data.signatureFile) {
        const formData = new FormData();
        formData.append('file', data.signatureFile);
        await uploadFile.mutateAsync(formData);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('simad_cert_signer_name', data.signerName);
        localStorage.setItem('simad_cert_signer_role', data.signerRole);
      }

      setSignerName(data.signerName);
      setSignerRole(data.signerRole);

      toast.success('Pengaturan sertifikat berhasil disimpan', {
        id: 'save-cert-setting',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Gagal menyimpan pengaturan', { id: 'save-cert-setting' });
    }
  };

  return (
    <CertificateSettingSection
      state={{
        isPending: uploadFile.isPending,
        signerName,
        signerRole,
      }}
      service={{
        onSaveSettings: handleSaveSettings,
      }}
    />
  );
}

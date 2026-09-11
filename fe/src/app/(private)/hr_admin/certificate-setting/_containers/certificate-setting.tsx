'use client';

import { CertificateSettingSection } from '@/components/page/hr_admin/CertificateSettingSection';
import { useApi } from '@/hooks/useService/useApi';
import { uploadCertificateTemplate, uploadSignature } from '@/utils/r2-utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CertificateSettingContainer() {
  const api = useApi();
  const [signerName, setSignerName] = useState('Budi Santoso, S.T., M.T.');
  const [signerRole, setSignerRole] = useState('Manager SDM');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [signatureFileName, setSignatureFileName] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateFileName, setTemplateFileName] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const uploadFile = api.file.mutate.upload();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('simad_cert_signer_name');
      const savedRole = localStorage.getItem('simad_cert_signer_role');
      const savedSigUrl = localStorage.getItem('simad_cert_signature_url');
      const savedSigName = localStorage.getItem('simad_cert_signature_name');
      const savedTplUrl = localStorage.getItem('simad_cert_template_url');
      const savedTplName = localStorage.getItem('simad_cert_template_name');

      if (savedName) setSignerName(savedName);
      if (savedRole) setSignerRole(savedRole);
      if (savedSigUrl) setSignatureUrl(savedSigUrl);
      if (savedSigName) setSignatureFileName(savedSigName);
      if (savedTplUrl) setTemplateUrl(savedTplUrl);
      if (savedTplName) setTemplateFileName(savedTplName);
    }
  }, []);

  const handleSaveSettings = async (data: {
    signerName: string;
    signerRole: string;
    signatureFile?: File;
    templateFile?: File;
  }) => {
    setIsSaving(true);
    try {
      toast.loading('Menyimpan pengaturan sertifikat...', {
        id: 'save-cert-setting',
      });

      let updatedSigUrl = signatureUrl;
      let updatedSigName = signatureFileName;
      let updatedTplUrl = templateUrl;
      let updatedTplName = templateFileName;

      // Upload file tanda tangan ke R2 jika ada file baru
      if (data.signatureFile) {
        toast.loading('Mengunggah tanda tangan ke Cloudflare R2...', {
          id: 'save-cert-setting',
        });
        updatedSigUrl = await uploadSignature(data.signatureFile);
        updatedSigName = data.signatureFile.name;

        // Catat file di database
        await uploadFile.mutateAsync({
          url: updatedSigUrl,
          originalName: data.signatureFile.name,
          mimeType: data.signatureFile.type,
          size: data.signatureFile.size,
        });

        setSignatureUrl(updatedSigUrl);
        setSignatureFileName(updatedSigName);
      }

      // Upload file template ke R2 jika ada file baru
      if (data.templateFile) {
        toast.loading('Mengunggah template sertifikat ke Cloudflare R2...', {
          id: 'save-cert-setting',
        });
        updatedTplUrl = await uploadCertificateTemplate(data.templateFile);
        updatedTplName = data.templateFile.name;

        // Catat file di database
        await uploadFile.mutateAsync({
          url: updatedTplUrl,
          originalName: data.templateFile.name,
          mimeType: data.templateFile.type,
          size: data.templateFile.size,
        });

        setTemplateUrl(updatedTplUrl);
        setTemplateFileName(updatedTplName);
      }

      // Simpan konfigurasi ke localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('simad_cert_signer_name', data.signerName);
        localStorage.setItem('simad_cert_signer_role', data.signerRole);
        if (updatedSigUrl) {
          localStorage.setItem('simad_cert_signature_url', updatedSigUrl);
          localStorage.setItem('simad_cert_signature_name', updatedSigName);
        }
        if (updatedTplUrl) {
          localStorage.setItem('simad_cert_template_url', updatedTplUrl);
          localStorage.setItem('simad_cert_template_name', updatedTplName);
        }
      }

      setSignerName(data.signerName);
      setSignerRole(data.signerRole);

      toast.success('Pengaturan sertifikat berhasil disimpan', {
        id: 'save-cert-setting',
      });
    } catch (error) {
      console.error('Failed to save certificate settings:', error);
      toast.error('Gagal menyimpan pengaturan sertifikat', {
        id: 'save-cert-setting',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplate = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simad_cert_template_url');
      localStorage.removeItem('simad_cert_template_name');
    }
    setTemplateUrl('');
    setTemplateFileName('');
    toast.success('Template sertifikat dikembalikan ke default PLN');
  };

  const handleResetSignature = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simad_cert_signature_url');
      localStorage.removeItem('simad_cert_signature_name');
    }
    setSignatureUrl('');
    setSignatureFileName('');
    toast.success('File tanda tangan berhasil dihapus');
  };

  return (
    <CertificateSettingSection
      state={{
        isPending: uploadFile.isPending || isSaving,
        signerName,
        signerRole,
        signatureUrl,
        signatureFileName,
        templateUrl,
        templateFileName,
        isPreviewOpen,
      }}
      service={{
        onSaveSettings: handleSaveSettings,
        onResetTemplate: handleResetTemplate,
        onResetSignature: handleResetSignature,
        onTogglePreview: setIsPreviewOpen,
      }}
    />
  );
}

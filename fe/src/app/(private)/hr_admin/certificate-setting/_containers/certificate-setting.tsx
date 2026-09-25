'use client';

import { CertificateSettingSection } from '@/components/page/hr_admin/CertificateSettingSection';
import { useApi } from '@/hooks/useService/useApi';
import { uploadCertificateTemplate, uploadSignature } from '@/utils/r2-utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CertificateSettingContainer() {
  const api = useApi();
  const [selectedOfficeId, setSelectedOfficeId] = useState('ALL');
  const [signerName, setSignerName] = useState('NURLANA');
  const [signerRole, setSignerRole] = useState('Senior Manager Keuangan, Komunikasi & Umum');
  const [certificateNumberFormat, setCertificateNumberFormat] = useState('SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [signatureFileName, setSignatureFileName] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateFileName, setTemplateFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const officesQuery = api.office.query.list();
  const uploadFile = api.file.mutate.upload();
  const settingsQuery = api.certificate.query.settings();
  const saveSettingsMutation = api.certificate.mutate.saveSettings();
  const createOfficeSettingMutation = api.certificate.mutate.createOfficeSetting();
  const updateOfficeSettingMutation = api.certificate.mutate.updateOfficeSetting();

  // Load general settings or office specific settings
  useEffect(() => {
    if (settingsQuery.data) {
      if (settingsQuery.data.signerName) setSignerName(settingsQuery.data.signerName);
      if (settingsQuery.data.signerRole) setSignerRole(settingsQuery.data.signerRole);
      if (settingsQuery.data.signatureUrl) setSignatureUrl(settingsQuery.data.signatureUrl);
      if (settingsQuery.data.templateUrl) setTemplateUrl(settingsQuery.data.templateUrl);
    }
  }, [settingsQuery.data]);

  const handleSaveSettings = async (data: {
    officeLocationId?: string;
    signerName: string;
    signerRole: string;
    certificateNumberFormat?: string;
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

      // Simpan konfigurasi ke backend
      if (data.officeLocationId && data.officeLocationId !== 'ALL') {
        await createOfficeSettingMutation.mutateAsync({
          officeLocationId: data.officeLocationId,
          signerName: data.signerName,
          signerRole: data.signerRole,
          certificateNumberFormat: data.certificateNumberFormat || 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
        });
      } else {
        await saveSettingsMutation.mutateAsync({
          signerName: data.signerName,
          signerRole: data.signerRole,
          signatureUrl: updatedSigUrl,
          templateUrl: updatedTplUrl,
        });
      }

      setSignerName(data.signerName);
      setSignerRole(data.signerRole);
      if (data.certificateNumberFormat) {
        setCertificateNumberFormat(data.certificateNumberFormat);
      }

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

  const handleResetTemplate = async () => {
    setTemplateUrl('');
    setTemplateFileName('');
    try {
      await saveSettingsMutation.mutateAsync({
        signerName,
        signerRole,
        signatureUrl,
        templateUrl: '',
      });
      toast.success('Template sertifikat dikembalikan ke default PLN');
    } catch (_err) {
      toast.error('Gagal memperbarui pengaturan template');
    }
  };

  const handleResetSignature = async () => {
    setSignatureUrl('');
    setSignatureFileName('');
    try {
      await saveSettingsMutation.mutateAsync({
        signerName,
        signerRole,
        signatureUrl: '',
        templateUrl,
      });
      toast.success('File tanda tangan berhasil dihapus');
    } catch (_err) {
      toast.error('Gagal memperbarui tanda tangan');
    }
  };

  return (
    <CertificateSettingSection
      state={{
        isPending: uploadFile.isPending || isSaving,
        offices: officesQuery.data ?? [],
        selectedOfficeId,
        signerName,
        signerRole,
        certificateNumberFormat,
        signatureUrl,
        signatureFileName,
        templateUrl,
        templateFileName,
      }}
      service={{
        onSelectOffice: setSelectedOfficeId,
        onSaveSettings: handleSaveSettings,
        onResetTemplate: handleResetTemplate,
        onResetSignature: handleResetSignature,
      }}
    />
  );
}

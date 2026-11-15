'use client';

import { CertificateSettingSection } from '@/components/page/hr_admin/CertificateSettingSection';
import { useApi } from '@/hooks/useService/useApi';
import { createUploadFormData, getErrorMessage } from '@/utils/upload-error';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CertificateSettingContainer() {
  const api = useApi();
  const [selectedOfficeId, setSelectedOfficeId] = useState('ALL');
  const [signerName, setSignerName] = useState('NURLANA');
  const [signerRole, setSignerRole] = useState('Senior Manager Keuangan, Komunikasi & Umum');
  const [certificateNumberFormat, setCertificateNumberFormat] = useState(
    'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
  );
  const [signatureUrl, setSignatureUrl] = useState('');
  const [signatureFileId, setSignatureFileId] = useState<string | undefined>(undefined);
  const [signatureFileName, setSignatureFileName] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateFileId, setTemplateFileId] = useState<string | undefined>(undefined);
  const [templateFileName, setTemplateFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const officesQuery = api.office.query.list();
  const uploadFile = api.file.mutate.upload();
  const settingsQuery = api.certificate.query.settings();
  const saveSettingsMutation = api.certificate.mutate.saveSettings();
  const createOfficeSettingMutation = api.certificate.mutate.createOfficeSetting();

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
      let updatedSigFileId = signatureFileId;
      let updatedSigName = signatureFileName;
      let updatedTplUrl = templateUrl;
      let updatedTplFileId = templateFileId;
      let updatedTplName = templateFileName;

      // Upload file tanda tangan langsung ke backend (BE -> R2 folder signatures/)
      if (data.signatureFile) {
        toast.loading('Mengunggah tanda tangan...', {
          id: 'save-cert-setting',
        });
        const uploadedSig = await uploadFile.mutateAsync(
          createUploadFormData(data.signatureFile, 'signatures'),
        );
        if (!uploadedSig.data?.url || !uploadedSig.data?.id) {
          throw new Error('Respons server tidak menyertakan metadata tanda tangan.');
        }

        updatedSigUrl = uploadedSig.data.url;
        updatedSigFileId = uploadedSig.data.id;
        updatedSigName = data.signatureFile.name;

        setSignatureUrl(updatedSigUrl);
        setSignatureFileId(updatedSigFileId);
        setSignatureFileName(updatedSigName);
      }

      // Upload file template langsung ke backend (BE -> R2 folder certificate-templates/)
      if (data.templateFile) {
        toast.loading('Mengunggah template sertifikat...', {
          id: 'save-cert-setting',
        });
        const uploadedTpl = await uploadFile.mutateAsync(
          createUploadFormData(data.templateFile, 'certificate-templates'),
        );
        if (!uploadedTpl.data?.url || !uploadedTpl.data?.id) {
          throw new Error('Respons server tidak menyertakan metadata template.');
        }

        updatedTplUrl = uploadedTpl.data.url;
        updatedTplFileId = uploadedTpl.data.id;
        updatedTplName = data.templateFile.name;

        setTemplateUrl(updatedTplUrl);
        setTemplateFileId(updatedTplFileId);
        setTemplateFileName(updatedTplName);
      }

      // Simpan konfigurasi ke backend
      if (data.officeLocationId && data.officeLocationId !== 'ALL') {
        await createOfficeSettingMutation.mutateAsync({
          officeLocationId: data.officeLocationId,
          signerName: data.signerName,
          signerRole: data.signerRole,
          signatureFileId: updatedSigFileId,
          templateFileId: updatedTplFileId,
          certificateNumberFormat:
            data.certificateNumberFormat || 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
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
      toast.error(`Gagal menyimpan pengaturan sertifikat: ${getErrorMessage(error)}`, {
        id: 'save-cert-setting',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplate = async () => {
    setTemplateUrl('');
    setTemplateFileId(undefined);
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
    setSignatureFileId(undefined);
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

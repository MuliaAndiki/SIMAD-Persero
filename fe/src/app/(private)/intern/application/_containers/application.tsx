'use client';

import { ApplicationSection } from '@/components/page/application/ApplicationSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { getFilePreviewUrl } from '@/utils/file-preview';
import { createUploadFormData, getErrorMessage } from '@/utils/upload-error';
import { useEffect, useRef } from 'react';

/**
 * Container untuk modul Internship Application (untuk INTERN).
 * Mengatur query React Query, local states, upload file, dan mutation actions.
 */
export default function ApplicationContainer() {
  const api = useApi();
  const ns = useAppNameSpace();
  const redirectedRef = useRef(false);

  // Queries
  const myApps = api.application.query.my();
  const officesQuery = api.office.query.list({ limit: 100 });

  // Profil intern belum lengkap (422 "Intern profile not found ...") —
  // arahkan ke halaman profil agar user melengkapi data terlebih dahulu.
  useEffect(() => {
    if (!redirectedRef.current && myApps.error?.message?.includes('Intern profile not found')) {
      redirectedRef.current = true;
      ns.alert.toast({
        title: 'Lengkapi Profil Terlebih Dahulu',
        message:
          'Profil intern belum lengkap. Silakan lengkapi profil Anda sebelum mengajukan magang.',
        icon: 'warning',
      });
      ns.router.replace('/intern/profile');
    }
  }, [myApps.error?.message, ns.alert, ns.router]);

  // Mutations
  const createMutation = api.application.mutate.create();
  const updateMutation = api.application.mutate.updateDraft();
  const submitMutation = api.application.mutate.submit();
  const deleteDraftMutation = api.application.mutate.deleteDraft();
  const cancelMutation = api.application.mutate.cancel();
  const uploadFileMutation = api.file.mutate.upload();

  const extractUploadedFileId = (res: {
    data?: { id?: string } | null;
    message?: string;
  }) => {
    if (res.data?.id) return res.data.id;
    throw new Error(
      res.message
        ? `Respons backend tidak menyertakan ID file (${res.message})`
        : 'Respons backend tidak menyertakan ID file.',
    );
  };

  // Unggah file langsung ke endpoint multipart backend (BE akan meneruskan ke R2 sesuai folder)
  const handleUploadFile = async (file: File, kind: 'cv' | 'pengantar' = 'pengantar') => {
    const docLabel = kind === 'cv' ? 'CV' : 'Surat Permohonan Fakultas';
    const sizeMb = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const folder = kind === 'cv' ? 'cv' : 'surat-pengantar';

    try {
      const formData = createUploadFormData(file, folder);
      const res = await uploadFileMutation.mutateAsync(formData);
      return { fileId: extractUploadedFileId(res), fileUrl: res.data?.url ?? undefined };
    } catch (backendErr) {
      throw new Error(
        `Gagal mengunggah ${docLabel} ("${file.name}", ${sizeMb}): ${getErrorMessage(backendErr)}`,
      );
    }
  };

  // Handle preview PDF file
  const handlePreviewFile = (fileUrl: string) => {
    const previewUrl = getFilePreviewUrl(fileUrl);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  // Actions
  const handleCreate = async (
    data: import('@/types/api/application.types').CreateApplicationBody,
  ) => {
    try {
      await createMutation.mutateAsync(data);
    } catch {
      // toast alert handled by mutation onError
    }
  };

  const handleUpdateDraft = async (
    id: string,
    data: {
      requestedStartDate?: string;
      requestedEndDate?: string;
      motivation?: string;
      coverLetterFileId?: string;
    },
  ) => {
    try {
      await updateMutation.mutateAsync({ params: { id }, body: data });
    } catch {
      // error handled by mutation onError
    }
  };

  const handleSubmitDraft = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Kirim Pengajuan?',
      icon: 'question',
      deskripsi:
        'Setelah diajukan, detail pengajuan tidak dapat diubah lagi sampai direview oleh HR.',
      confirmButtonText: 'Kirim Sekarang',
    });
    if (!confirmed) return;

    try {
      await submitMutation.mutateAsync({ id });
    } catch {
      // error handled by mutation onError
    }
  };

  const handleDeleteDraft = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Hapus Draf Pengajuan?',
      icon: 'warning',
      deskripsi: 'Draf pengajuan magang ini akan dihapus secara permanen.',
      confirmButtonText: 'Ya, Hapus Draf',
    });
    if (!confirmed) return;

    try {
      await deleteDraftMutation.mutateAsync({ id });

      ns.alert.toast({
        title: 'Draft Dihapus',
        message: 'Draft pengajuan dan file terkait berhasil dihapus',
        icon: 'success',
      });
    } catch {
      // error handled by mutation onError
    }
  };

  const handleCancel = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Batalkan Pengajuan?',
      icon: 'warning',
      deskripsi:
        'Pengajuan magang ini akan dibatalkan. Anda dapat membuat pengajuan baru setelahnya.',
      confirmButtonText: 'Ya, Batalkan',
    });
    if (!confirmed) return;

    try {
      await cancelMutation.mutateAsync({ id });
    } catch {
      // error handled by mutation onError
    }
  };

  return (
    <ApplicationSection
      state={{
        isPending: myApps.isPending,
        isError: myApps.isError,
        errorMessage: myApps.error?.message,
        applications: myApps.data ?? [],
        offices: officesQuery.data ?? [],
        isOfficesPending: officesQuery.isPending,
        isSubmitting:
          createMutation.isPending ||
          updateMutation.isPending ||
          submitMutation.isPending ||
          deleteDraftMutation.isPending ||
          cancelMutation.isPending,
        isUploading: uploadFileMutation.isPending,
      }}
      service={{
        onCreate: handleCreate,
        onUpdateDraft: handleUpdateDraft,
        onSubmitDraft: handleSubmitDraft,
        onDeleteDraft: handleDeleteDraft,
        onCancel: handleCancel,
        onUploadFile: handleUploadFile,
        onPreviewFile: handlePreviewFile,
      }}
    />
  );
}

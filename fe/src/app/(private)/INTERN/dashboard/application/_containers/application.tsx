'use client';

import { ApplicationSection } from '@/components/page/application/ApplicationSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
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
      ns.router.replace('/INTERN/dashboard/profile');
    }
  }, [myApps.error?.message, ns.alert, ns.router]);

  // Mutations
  const createMutation = api.application.mutate.create();
  const updateMutation = api.application.mutate.updateDraft();
  const submitMutation = api.application.mutate.submit();
  const cancelMutation = api.application.mutate.cancel();
  const uploadFileMutation = api.file.mutate.upload();

  // Handle uploading file first
  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadFileMutation.mutateAsync(formData);
      if (res.data?.id) {
        return { fileId: res.data.id };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Actions
  const handleCreate = async (data: {
    requestedStartDate: string;
    requestedEndDate: string;
    motivation?: string;
    coverLetterFileId: string;
  }) => {
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

  const handleCancel = async (id: string) => {
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
        isSubmitting:
          createMutation.isPending ||
          updateMutation.isPending ||
          submitMutation.isPending ||
          cancelMutation.isPending,
        isUploading: uploadFileMutation.isPending,
      }}
      service={{
        onCreate: handleCreate,
        onUpdateDraft: handleUpdateDraft,
        onSubmitDraft: handleSubmitDraft,
        onCancel: handleCancel,
        onUploadFile: handleUploadFile,
      }}
    />
  );
}

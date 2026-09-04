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

  // Handle uploading file first (directly to R2 from FE, then register URL in DB)
  const handleUploadFile = async (file: File) => {
    try {
      const { uploadFileUniv } = await import('@/utils/r2-utils');
      const fileUnivUrl = await uploadFileUniv(file);

      const res = await uploadFileMutation.mutateAsync({
        url: fileUnivUrl,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      if (res.data?.id) {
        return { fileId: res.data.id, fileUrl: fileUnivUrl };
      }
      return null;
    } catch (err) {
      console.error('Failed to upload file univ:', err);
      return null;
    }
  };

  // Handle preview PDF file
  const handlePreviewFile = (fileUrl: string) => {
    // Open PDF in new tab for preview
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
      // Jika ada file baru, hapus file lama dari R2 untuk mencegah double upload
      if (data.coverLetterFileId) {
        const app = (myApps.data ?? []).find((a) => a.id === id);
        if (app?.introductionLetterFile?.url) {
          const { deleteObject } = await import('@/utils/r2-utils');
          await deleteObject(app.introductionLetterFile.url).catch((err) => {
            console.warn('Failed to delete old file from R2:', err);
          });
        }
      }

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
    const app = (myApps.data ?? []).find((a) => a.id === id);
    const confirmed = await ns.alert.confirm({
      title: 'Hapus Draf Pengajuan?',
      icon: 'warning',
      deskripsi: 'Draf pengajuan magang ini akan dihapus secara permanen.',
      confirmButtonText: 'Ya, Hapus Draf',
    });
    if (!confirmed) return;

    try {
      // Hapus file dari R2 terlebih dahulu sebelum hapus draft
      if (app?.introductionLetterFile?.url) {
        const { deleteObject } = await import('@/utils/r2-utils');
        await deleteObject(app.introductionLetterFile.url).catch((err) => {
          console.warn('Failed to delete file from R2:', err);
          // Tetap lanjut hapus draft meskipun gagal hapus file
        });
      }
      
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

'use client';

import { ApplicationSection } from '@/components/page/application/ApplicationSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { getFilePreviewUrl } from '@/utils/file-preview';
import {
  type R2UploadActionResult,
  deleteObject,
  uploadApplicationDocumentAction,
} from '@/utils/r2-utils';
import { describeServerActionUploadError, getErrorMessage } from '@/utils/upload-error';
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

  // Handle uploading file: R2 via Server Action (terstruktur), fallback multipart ke API backend
  const handleUploadFile = async (file: File, kind: 'cv' | 'pengantar' = 'pengantar') => {
    const docLabel = kind === 'cv' ? 'CV' : 'Surat Permohonan Fakultas';
    const sizeMb = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const normalizedMime =
      file.type ||
      (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    let r2Result: R2UploadActionResult | null = null;
    let feError = '';

    try {
      const actionFormData = new FormData();
      actionFormData.append('file', file);
      actionFormData.append('kind', kind);
      r2Result = await uploadApplicationDocumentAction(actionFormData);
    } catch (err) {
      feError = describeServerActionUploadError(err);
    }

    if (r2Result?.ok) {
      try {
        const res = await uploadFileMutation.mutateAsync({
          url: r2Result.url,
          originalName: file.name,
          mimeType: normalizedMime,
          size: file.size,
        });
        return { fileId: extractUploadedFileId(res), fileUrl: r2Result.url };
      } catch (registerErr) {
        await deleteObject(r2Result.url).catch(() => {});
        throw new Error(
          `Gagal mendaftarkan ${docLabel} ("${file.name}", ${sizeMb}) ke server backend: ${getErrorMessage(registerErr)}`,
        );
      }
    }

    const r2FailureReason = r2Result && !r2Result.ok ? r2Result.error : feError;
    if (r2Result && !r2Result.ok && r2Result.code === 'INVALID_FILE') {
      throw new Error(
        `Gagal mengunggah ${docLabel} ("${file.name}", ${sizeMb}): ${r2FailureReason}`,
      );
    }

    // Fallback: unggah langsung melalui endpoint backend (mengatasi limit body 4.5 MB Vercel atau missing env R2 FE)
    try {
      const fallbackFormData = new FormData();
      const uploadableFile =
        file.type === normalizedMime ? file : new File([file], file.name, { type: normalizedMime });
      fallbackFormData.append('file', uploadableFile);

      const res = await uploadFileMutation.mutateAsync(fallbackFormData);
      return { fileId: extractUploadedFileId(res), fileUrl: res.data?.url ?? undefined };
    } catch (backendErr) {
      const beReason = getErrorMessage(backendErr);
      throw new Error(
        `Gagal mengunggah ${docLabel} ("${file.name}", ${sizeMb}) — [Upload R2 Frontend: ${r2FailureReason}] | [Upload API Backend: ${beReason}]`,
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
      // Jika ada file baru, hapus file lama dari R2 untuk mencegah double upload
      if (data.coverLetterFileId) {
        const app = (myApps.data ?? []).find((a) => a.id === id);
        if (app?.introductionLetterFile?.url) {
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

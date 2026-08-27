import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { useCallback, useState } from 'react';

export function useProfileLogic() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);

  const profile = api.user.query.profile();
  const sessions = api.auth.query.sessions();

  const logout = api.auth.mutate.logout();
  const uploadPhoto = api.user.mutate.uploadPhoto();
  const deleteSession = api.auth.mutate.deleteSession();
  const logoutAll = api.auth.mutate.logoutAll();
  const changeEmail = api.auth.mutate.changeEmail();
  const changeEmailVerify = api.auth.mutate.changeEmailVerify();

  const handleUploadPhoto = useCallback(
    async (file: File) => {
      try {
        const { uploadAvatar, deleteObject } = await import('@/utils/r2-utils');

        // Delete old avatar photo from R2 if present
        if (profile.data?.profilePhoto) {
          await deleteObject(profile.data.profilePhoto).catch((err) => {
            console.warn('Failed to delete old avatar from R2:', err);
          });
        }

        const avatarUrl = await uploadAvatar(file);
        await uploadPhoto.mutateAsync({
          url: avatarUrl,
          originalName: file.name,
        });
      } catch (err) {
        console.error('Failed to upload avatar to R2:', err);
      }
    },
    [uploadPhoto, profile.data?.profilePhoto],
  );

  const handleLogout = useCallback(() => {
    logout.mutate({});
  }, [logout]);

  const handleOpenChangeEmail = useCallback(() => {
    setChangeEmailModalOpen(true);
  }, []);

  const handleCloseChangeEmail = useCallback(() => {
    setChangeEmailModalOpen(false);
  }, []);

  const handleChangeEmailSubmit = useCallback(
    async (data: { newEmail: string; password: string }) => {
      try {
        await changeEmail.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [changeEmail],
  );

  const handleVerifyTokenSubmit = useCallback(
    async (token: string) => {
      try {
        await changeEmailVerify.mutateAsync({ token });
        void profile.refetch();
        return true;
      } catch {
        return false;
      }
    },
    [changeEmailVerify, profile],
  );

  const handleRevokeSession = useCallback(
    async (sessionId: string) => {
      const confirmed = await ns.alert.confirm({
        title: 'Cabut Sesi?',
        deskripsi: 'Sesi pada perangkat ini akan diakhiri.',
        icon: 'warning',
        confirmButtonText: 'Ya, Cabut',
      });
      if (!confirmed) return;
      await deleteSession.mutateAsync({ sessionId });
    },
    [deleteSession, ns.alert],
  );

  const handleLogoutAll = useCallback(async () => {
    const confirmed = await ns.alert.confirm({
      title: 'Keluar Semua Perangkat?',
      deskripsi: 'Seluruh sesi login pada perangkat lain akan diakhiri.',
      icon: 'warning',
      confirmButtonText: 'Ya, Keluar Semua',
    });
    if (!confirmed) return;
    await logoutAll.mutateAsync();
  }, [logoutAll, ns.alert]);

  return {
    profile,
    sessions,
    changeEmailModalOpen,
    isUploading: uploadPhoto.isPending,
    isChangingEmail: changeEmail.isPending || changeEmailVerify.isPending,
    isRevokingSession: deleteSession.isPending || logoutAll.isPending,
    isLogoutPending: logout.isPending,
    alert: ns.alert,
    actions: {
      handleUploadPhoto,
      handleLogout,
      handleOpenChangeEmail,
      handleCloseChangeEmail,
      handleChangeEmailSubmit,
      handleVerifyTokenSubmit,
      handleRevokeSession,
      handleLogoutAll,
    },
  };
}

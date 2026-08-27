'use client';

import { ProfileSection } from '@/components/page/profile/ProfileSection';
import { useProfileLogic } from '@/hooks/useProfileLogic';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman profil Intern (GET /users/profile; POST /users/profile/photo; GET /auth/sessions).
 *
 * Logika profil umum, sesi, & ubah email di-handle useProfileLogic; internProfile diambil spesifik.
 */
export default function ProfileContainer() {
  const api = useApi();
  const {
    profile,
    sessions,
    changeEmailModalOpen,
    isUploading,
    isChangingEmail,
    isRevokingSession,
    isLogoutPending,
    alert,
    actions,
  } = useProfileLogic();

  const internProfile = api.internship.query.myProfile();

  return (
    <ProfileSection
      state={{
        isPending: profile.isPending || isLogoutPending || internProfile.isLoading,
        isError: profile.isError,
        errorMessage: profile.error?.message,
        profile: profile.data ?? null,
        internProfile: internProfile.data ?? null,
        isUploading,
        alert,
        sessions: sessions.data ?? [],
        isSessionsPending: sessions.isPending,
        isRevokingSession,
        changeEmailModalOpen,
        isChangingEmail,
      }}
      service={{
        onUploadPhoto: actions.handleUploadPhoto,
        onLogout: actions.handleLogout,
        onOpenChangeEmail: actions.handleOpenChangeEmail,
        onCloseChangeEmail: actions.handleCloseChangeEmail,
        onChangeEmailSubmit: actions.handleChangeEmailSubmit,
        onVerifyTokenSubmit: actions.handleVerifyTokenSubmit,
        onRevokeSession: actions.handleRevokeSession,
        onLogoutAll: actions.handleLogoutAll,
      }}
    />
  );
}

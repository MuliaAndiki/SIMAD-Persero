'use client';

import { ProfileSection } from '@/components/page/profile/ProfileSection';
import { useProfileLogic } from '@/hooks/useProfileLogic';

/**
 * Container halaman profil HR Admin (GET /users/profile; POST /users/profile/photo; GET /auth/sessions).
 *
 * Logika, state, & API ada di useProfileLogic; ProfileSection hanya presentasi.
 * Data magang (internProfile) tidak relevan untuk role HR — dikosongkan.
 */
export default function HrProfileContainer() {
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

  return (
    <ProfileSection
      state={{
        isPending: profile.isPending || isLogoutPending,
        isError: profile.isError,
        errorMessage: profile.error?.message,
        profile: profile.data ?? null,
        internProfile: null,
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

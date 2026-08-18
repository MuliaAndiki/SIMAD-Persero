'use client';

import { ProfileSection } from '@/components/page/profile/ProfileSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman profil HR Admin (GET /users/profile; POST /users/profile/photo).
 *
 * Logika, state, & API ada di sini; ProfileSection hanya presentasi.
 * Data magang (internProfile) tidak relevan untuk role HR — dikosongkan.
 */
export default function HrProfileContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const profile = api.user.query.profile();
  const logout = api.auth.mutate.logout();
  const uploadPhoto = api.user.mutate.uploadPhoto();

  const handleUploadPhoto = (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    uploadPhoto.mutate(formData);
  };

  const handleLogout = () => {
    logout.mutate({});
  };

  return (
    <ProfileSection
      state={{
        isPending: profile.isPending || logout.isPending,
        isError: profile.isError,
        errorMessage: profile.error?.message,
        profile: profile.data ?? null,
        internProfile: null,
        isUploading: uploadPhoto.isPending,
        alert: ns.alert,
      }}
      service={{ onUploadPhoto: handleUploadPhoto, onLogout: handleLogout }}
    />
  );
}

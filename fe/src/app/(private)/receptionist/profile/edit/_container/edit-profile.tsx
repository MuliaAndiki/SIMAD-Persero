'use client';

import { EditProfileSection } from '@/components/page/profile/EditProfileSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman ubah profil Receptionist (GET /users/profile; PATCH /users/profile).
 */
export default function ReceptionistEditProfileContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const profile = api.user.query.profile();
  const updateProfile = api.user.mutate.updateProfile();

  const handleUpdateProfile = (data: { fullName: string; phone: string }) => {
    updateProfile.mutate(data, {
      onSuccess: () => ns.router.replace('/receptionist/profile'),
    });
  };

  return (
    <EditProfileSection
      state={{
        isPending: profile.isPending,
        isError: profile.isError,
        errorMessage: profile.error?.message,
        profile: profile.data ?? null,
        isUpdating: updateProfile.isPending,
      }}
      service={{ onUpdateProfile: handleUpdateProfile }}
    />
  );
}

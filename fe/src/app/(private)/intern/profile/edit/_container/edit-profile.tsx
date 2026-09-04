'use client';

import { EditProfileSection } from '@/components/page/profile/EditProfileSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman ubah profil (GET /users/profile; PATCH /users/profile).
 *
 * Logika, state, & API ada di sini; EditProfileSection hanya presentasi.
 * Setelah sukses disimpan, kembali ke halaman profil utama.
 */
export default function EditProfileContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const profile = api.user.query.profile();
  const updateProfile = api.user.mutate.updateProfile();

  const handleUpdateProfile = (data: { fullName: string }) => {
    updateProfile.mutate(data, {
      onSuccess: () => ns.router.replace('/intern/profile'),
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

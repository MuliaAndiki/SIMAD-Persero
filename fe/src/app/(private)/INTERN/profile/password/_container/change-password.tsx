'use client';

import { ChangePasswordSection } from '@/components/page/profile/ChangePasswordSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman ganti password (PATCH /users/change-password).
 *
 * Logika, state, & API ada di sini; ChangePasswordSection hanya presentasi.
 * Setelah sukses disimpan, kembali ke halaman profil utama.
 */
export default function ChangePasswordContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const changePassword = api.user.mutate.changePassword();

  const handleChangePassword = (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    changePassword.mutate(data, {
      onSuccess: () => ns.router.replace('/INTERN/profile'),
    });
  };

  return (
    <ChangePasswordSection
      state={{ isChangingPassword: changePassword.isPending }}
      service={{ onChangePassword: handleChangePassword }}
    />
  );
}

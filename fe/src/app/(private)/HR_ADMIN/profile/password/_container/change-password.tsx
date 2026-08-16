'use client';

import { ChangePasswordSection } from '@/components/page/profile/ChangePasswordSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman ganti password HR Admin (PATCH /users/change-password).
 *
 * Logika, state, & API ada di sini; ChangePasswordSection hanya presentasi.
 * Setelah sukses disimpan, kembali ke halaman profil utama.
 */
export default function HrChangePasswordContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const changePassword = api.user.mutate.changePassword();

  const handleChangePassword = (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    changePassword.mutate(data, {
      onSuccess: () => ns.router.replace('/HR_ADMIN/profile'),
    });
  };

  return (
    <ChangePasswordSection
      state={{
        isChangingPassword: changePassword.isPending,
        backPath: '/HR_ADMIN/profile',
      }}
      service={{ onChangePassword: handleChangePassword }}
    />
  );
}

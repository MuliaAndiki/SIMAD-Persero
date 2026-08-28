'use client';

import { ChangePasswordSection } from '@/components/page/profile/ChangePasswordSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman ganti password Receptionist (PATCH /users/change-password).
 */
export default function ReceptionistChangePasswordContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const changePassword = api.user.mutate.changePassword();

  const handleChangePassword = (data: { oldPassword: string; newPassword: string }) => {
    changePassword.mutate(data, {
      onSuccess: () => ns.router.replace('/receptionist/profile'),
    });
  };

  return (
    <ChangePasswordSection
      state={{
        isChangingPassword: changePassword.isPending,
        backPath: '/receptionist/profile',
      }}
      service={{ onChangePassword: handleChangePassword }}
    />
  );
}

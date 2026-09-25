import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import { type UserCacheContext, readUserSnapshot } from '@/utils/cache/user.cache';

import type {
  ChangePasswordBody,
  ProfileResponse,
  UpdateProfileBody,
} from '@/types/api/user.types';

export function useUpdateProfile() {
  return useAppMutation<ProfileResponse, UpdateProfileBody, UserCacheContext>({
    mutationFn: (body) => Api.User.UpdateProfile(body),
    invalidateKeys: [queryKey.userRoot(), queryKey.authRoot()],
    errorTitle: 'Gagal Memperbarui Profil',
    optimistic: (ns) => ({ previousData: readUserSnapshot(ns) }),
  });
}

export function useUploadPhoto() {
  return useAppMutation<
    ProfileResponse,
    FormData | { url: string; originalName?: string },
    UserCacheContext
  >({
    mutationFn: (payload) => Api.User.UploadPhoto(payload),
    invalidateKeys: [queryKey.userRoot(), queryKey.authRoot()],
    errorTitle: 'Gagal Mengunggah Foto',
    optimistic: (ns) => ({ previousData: readUserSnapshot(ns) }),
  });
}

export function useChangePassword() {
  return useAppMutation<
    null,
    Pick<ChangePasswordBody, 'oldPassword' | 'newPassword'>,
    UserCacheContext
  >({
    mutationFn: (body) => Api.User.ChangePassword(body),
    errorTitle: 'Gagal Mengubah Password',
    optimistic: (ns) => ({ previousData: readUserSnapshot(ns) }),
  });
}

export function useDeleteAccount() {
  return useAppMutation<null, void, UserCacheContext>({
    mutationFn: () => Api.User.DeleteAccount(),
    errorTitle: 'Gagal Menghapus Akun',
    optimistic: (ns) => ({ previousData: readUserSnapshot(ns) }),
  });
}

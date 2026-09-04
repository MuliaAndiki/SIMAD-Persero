import type { TResponse } from "@/api/types/response.types";
import { queryKey } from "@/configs/query-key";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import Api from "@/services/props.service";
import {
  type UserCacheContext,
  readUserSnapshot,
} from "@/utils/cache/user.cache";

import type {
  ChangePasswordBody,
  ProfileResponse,
  UpdateProfileBody,
} from "@/types/api/user.types";
import { useMutation } from "@tanstack/react-query";

export function useUpdateProfile() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ProfileResponse>,
    Error,
    UpdateProfileBody,
    UserCacheContext
  >({
    mutationFn: (body: UpdateProfileBody) => Api.User.UpdateProfile(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.userRoot() });
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.authRoot() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.userRoot() });
      const previousData = readUserSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useUploadPhoto() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ProfileResponse>,
    Error,
    FormData | { url: string; originalName?: string },
    UserCacheContext
  >({
    mutationFn: (payload) => Api.User.UploadPhoto(payload),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.userRoot() });
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.authRoot() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.userRoot() });
      const previousData = readUserSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useChangePassword() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ChangePasswordBody, "oldPassword" | "newPassword">,
    UserCacheContext
  >({
    mutationFn: (
      body: Pick<ChangePasswordBody, "oldPassword" | "newPassword">,
    ) => Api.User.ChangePassword(body),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.userRoot() });
      const previousData = readUserSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useDeleteAccount() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, void, UserCacheContext>({
    mutationFn: () => Api.User.DeleteAccount(),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.userRoot() });
      const previousData = readUserSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}

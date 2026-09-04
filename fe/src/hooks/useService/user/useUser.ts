import {
  useChangePassword,
  useDeleteAccount,
  useUpdateProfile,
  useUploadPhoto,
} from "./state/mutate";
import { useProfile } from "./state/query";

export const useUser = () => {
  return {
    query: {
      profile: useProfile,
    },
    mutate: {
      updateProfile: useUpdateProfile,
      uploadPhoto: useUploadPhoto,
      changePassword: useChangePassword,
      deleteAccount: useDeleteAccount,
    },
  };
};

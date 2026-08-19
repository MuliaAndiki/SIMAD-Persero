import {
  useChangeEmail,
  useChangeEmailVerify,
  useChangePassword,
  useDeleteSession,
  useForgotPassword,
  useGoogleLogin,
  useLogin,
  useLogout,
  useLogoutAll,
  useRefreshToken,
  useRegister,
  useResetPassword,
  useSendMagicLink,
  useSendVerifyEmail,
  useVerifyEmail,
  useVerifyMagicLink,
} from './state/mutate';
import { useMe, useSessions } from './state/query';

/**
 * Facade modul Auth — hanya grouping layer, tanpa business logic.
 *
 * Component mengakses endpoint auth melalui:
 *   const api = useApi();
 *   api.auth.query.me();
 *   api.auth.mutate.login();
 */
export const useAuth = () => {
  return {
    mutate: {
      register: useRegister,
      sendVerifyEmail: useSendVerifyEmail,
      verifyEmail: useVerifyEmail,
      login: useLogin,
      googleLogin: useGoogleLogin,
      sendMagicLink: useSendMagicLink,
      verifyMagicLink: useVerifyMagicLink,
      forgotPassword: useForgotPassword,
      resetPassword: useResetPassword,
      refreshToken: useRefreshToken,
      logout: useLogout,
      logoutAll: useLogoutAll,
      changePassword: useChangePassword,
      changeEmail: useChangeEmail,
      changeEmailVerify: useChangeEmailVerify,
      deleteSession: useDeleteSession,
    },

    query: {
      me: useMe,
      sessions: useSessions,
    },
  };
};

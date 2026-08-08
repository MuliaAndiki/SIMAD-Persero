import { useMutation } from '@tanstack/react-query';

import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import AuthService from '@/services/api/auth.service';
import type {
  AuthSessionResponse,
  ChangeEmailBody,
  ChangeEmailVerifyBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  RefreshTokenResponse,
  RegisterBody,
  RegisterResponse,
  ResetPasswordBody,
  SendMagicLinkBody,
  SendVerifyEmailBody,
  SessionParams,
  VerifyEmailBody,
  VerifyMagicLinkBody,
} from '@/types/api/auth.types';
import { type AuthCacheContext, readAuthSnapshot } from '@/utils/cache/auth.cache';

/**
 * POST /auth/register
 */
export function useRegister() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<RegisterResponse>,
    Error,
    Pick<RegisterBody, 'fullName' | 'email' | 'password'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<RegisterBody, 'fullName' | 'email' | 'password'>) =>
      AuthService.Register(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/verify-email/send
 */
export function useSendVerifyEmail() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<SendVerifyEmailBody, 'email'>, AuthCacheContext>({
    mutationFn: (payload: Pick<SendVerifyEmailBody, 'email'>) =>
      AuthService.SendVerifyEmail(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/verify-email
 */
export function useVerifyEmail() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<VerifyEmailBody, 'token'>, AuthCacheContext>({
    mutationFn: (payload: Pick<VerifyEmailBody, 'token'>) => AuthService.VerifyEmail(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/login
 */
export function useLogin() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<AuthSessionResponse>,
    Error,
    Pick<LoginBody, 'email' | 'password'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<LoginBody, 'email' | 'password'>) => AuthService.Login(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/magic-link/send
 */
export function useSendMagicLink() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<SendMagicLinkBody, 'email'>, AuthCacheContext>({
    mutationFn: (payload: Pick<SendMagicLinkBody, 'email'>) => AuthService.SendMagicLink(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/magic-link/verify
 */
export function useVerifyMagicLink() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<AuthSessionResponse>,
    Error,
    Pick<VerifyMagicLinkBody, 'token'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<VerifyMagicLinkBody, 'token'>) =>
      AuthService.VerifyMagicLink(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/forgot-password
 */
export function useForgotPassword() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<ForgotPasswordBody, 'email'>, AuthCacheContext>({
    mutationFn: (payload: Pick<ForgotPasswordBody, 'email'>) => AuthService.ForgotPassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/reset-password
 */
export function useResetPassword() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ResetPasswordBody, 'token' | 'password'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ResetPasswordBody, 'token' | 'password'>) =>
      AuthService.ResetPassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/refresh-token
 */
export function useRefreshToken() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<RefreshTokenResponse>,
    Error,
    Pick<RefreshTokenBody, 'refreshToken'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<RefreshTokenBody, 'refreshToken'>) =>
      AuthService.RefreshToken(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/logout — mengakhiri sesi saat ini, invalidate cache user & sesi.
 */
export function useLogout() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<LogoutBody, 'refreshToken'>, AuthCacheContext>({
    mutationFn: (payload: Pick<LogoutBody, 'refreshToken'>) => AuthService.Logout(payload),

    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/logout-all — mengakhiri seluruh sesi, invalidate cache user & sesi.
 */
export function useLogoutAll() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, void, AuthCacheContext>({
    mutationFn: () => AuthService.LogoutAll(),

    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * PATCH /auth/change-password
 */
export function useChangePassword() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ChangePasswordBody, 'currentPassword' | 'newPassword'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ChangePasswordBody, 'currentPassword' | 'newPassword'>) =>
      AuthService.ChangePassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * PATCH /auth/change-email — email user berpotensi berubah, invalidate profil.
 */
export function useChangeEmail() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ChangeEmailBody, 'newEmail' | 'password'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ChangeEmailBody, 'newEmail' | 'password'>) =>
      AuthService.ChangeEmail(payload),

    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * POST /auth/change-email/verify — email user berubah, invalidate profil.
 */
export function useChangeEmailVerify() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ChangeEmailVerifyBody, 'token'>,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ChangeEmailVerifyBody, 'token'>) =>
      AuthService.ChangeEmailVerify(payload),

    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

/**
 * DELETE /auth/sessions/:sessionId — daftar sesi berubah, invalidate sessions.
 */
export function useDeleteSession() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<SessionParams, 'sessionId'>, AuthCacheContext>({
    mutationFn: (payload: Pick<SessionParams, 'sessionId'>) => AuthService.DeleteSession(payload),

    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKey } from '@/configs/query-key';
import AuthService from '@/services/api/auth.service';
import type {
  ChangeEmailBody,
  ChangeEmailVerifyBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
  SendMagicLinkBody,
  SendVerifyEmailBody,
  SessionParams,
  VerifyEmailBody,
  VerifyMagicLinkBody,
} from '@/types/api/auth.types';

/**
 * POST /auth/register
 */
export function useRegister() {
  return useMutation({
    mutationFn: (payload: Pick<RegisterBody, 'fullName' | 'email' | 'password'>) =>
      AuthService.Register(payload),
  });
}

/**
 * POST /auth/verify-email/send
 */
export function useSendVerifyEmail() {
  return useMutation({
    mutationFn: (payload: Pick<SendVerifyEmailBody, 'email'>) =>
      AuthService.SendVerifyEmail(payload),
  });
}

/**
 * POST /auth/verify-email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: Pick<VerifyEmailBody, 'token'>) => AuthService.VerifyEmail(payload),
  });
}

/**
 * POST /auth/login
 */
export function useLogin() {
  return useMutation({
    mutationFn: (payload: Pick<LoginBody, 'email' | 'password'>) => AuthService.Login(payload),
  });
}

/**
 * POST /auth/magic-link/send
 */
export function useSendMagicLink() {
  return useMutation({
    mutationFn: (payload: Pick<SendMagicLinkBody, 'email'>) => AuthService.SendMagicLink(payload),
  });
}

/**
 * POST /auth/magic-link/verify
 */
export function useVerifyMagicLink() {
  return useMutation({
    mutationFn: (payload: Pick<VerifyMagicLinkBody, 'token'>) =>
      AuthService.VerifyMagicLink(payload),
  });
}

/**
 * POST /auth/forgot-password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: Pick<ForgotPasswordBody, 'email'>) => AuthService.ForgotPassword(payload),
  });
}

/**
 * POST /auth/reset-password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: Pick<ResetPasswordBody, 'token' | 'password'>) =>
      AuthService.ResetPassword(payload),
  });
}

/**
 * POST /auth/refresh-token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: (payload: Pick<RefreshTokenBody, 'refreshToken'>) =>
      AuthService.RefreshToken(payload),
  });
}

/**
 * POST /auth/logout — mengakhiri sesi saat ini, invalidate cache user & sesi.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<LogoutBody, 'refreshToken'>) => AuthService.Logout(payload),

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
      await queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
  });
}

/**
 * POST /auth/logout-all — mengakhiri seluruh sesi, invalidate cache user & sesi.
 */
export function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.LogoutAll(),

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
      await queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
  });
}

/**
 * PATCH /auth/change-password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: Pick<ChangePasswordBody, 'currentPassword' | 'newPassword'>) =>
      AuthService.ChangePassword(payload),
  });
}

/**
 * PATCH /auth/change-email — email user berpotensi berubah, invalidate profil.
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<ChangeEmailBody, 'newEmail' | 'password'>) =>
      AuthService.ChangeEmail(payload),

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
    },
  });
}

/**
 * POST /auth/change-email/verify — email user berubah, invalidate profil.
 */
export function useChangeEmailVerify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<ChangeEmailVerifyBody, 'token'>) =>
      AuthService.ChangeEmailVerify(payload),

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey.auth.me() });
    },
  });
}

/**
 * DELETE /auth/sessions/:sessionId — daftar sesi berubah, invalidate sessions.
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<SessionParams, 'sessionId'>) => AuthService.DeleteSession(payload),

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKey.auth.sessions(),
      });
    },
  });
}

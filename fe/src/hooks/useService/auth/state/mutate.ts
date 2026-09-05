import { useMutation } from "@tanstack/react-query";

import type { TResponse } from "@/api/types/response.types";
import { getRoleDashboardPath } from "@/configs/app.config";
import { queryKey } from "@/configs/query-key";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import AuthService from "@/services/api/auth.service";
import type {
  AuthSessionResponse,
  ChangeEmailBody,
  ChangeEmailVerifyBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  GoogleLoginBody,
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
} from "@/types/api/auth.types";
import {
  type AuthCacheContext,
  readAuthSnapshot,
} from "@/utils/cache/auth.cache";
import { ResponseTitles } from "@/utils/response-titles";
import {
  clearSessionCookies,
  getRefreshToken,
  setSessionCookies,
} from "@/utils/session-cookie";
import { useRouter } from "next/navigation";

/**
 * POST /auth/register
 */
export function useRegister() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<RegisterResponse>,
    Error,
    Pick<RegisterBody, "fullName" | "email" | "password">,
    AuthCacheContext
  >({
    mutationFn: (
      payload: Pick<RegisterBody, "fullName" | "email" | "password">,
    ) => AuthService.Register(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.auth.registerFailed,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/verify-email/send
 */
export function useSendVerifyEmail() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<SendVerifyEmailBody, "email">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<SendVerifyEmailBody, "email">) =>
      AuthService.SendVerifyEmail(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/verify-email
 */
export function useVerifyEmail() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<VerifyEmailBody, "token">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<VerifyEmailBody, "token">) =>
      AuthService.VerifyEmail(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/login
 */
export function useLogin() {
  const ns = useAppNameSpace();
  const router = useRouter();
  return useMutation<
    TResponse<AuthSessionResponse>,
    Error,
    Pick<LoginBody, "email" | "password">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<LoginBody, "email" | "password">) =>
      AuthService.Login(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res, variables) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });

      const data = res.data;
      if (data) {
        // Simpan seluruh token ke cookie — backend hanya mengembalikan token di body.
        setSessionCookies({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.user?.role,
          expiresIn: data.expiresIn,
        });

        // Simpan data akun terakhir untuk login otomatis tanpa ketik ulang email
        const userEmail = data.user?.email || variables?.email;
        if (userEmail && typeof window !== "undefined") {
          try {
            const accountInfo = {
              email: userEmail,
              fullName: data.user?.fullName,
              avatarUrl:
                (data.user as any)?.avatarUrl ||
                (data.user as any)?.profilePhoto,
            };
            localStorage.setItem(
              "simad_remembered_account",
              JSON.stringify(accountInfo),
            );
            localStorage.setItem("simad_last_email", userEmail);
          } catch {}
        }
      }

      // Redirect sesuai role akun — setiap role punya folder dashboard sendiri.
      const role = res.data?.user?.role;
      router.push(getRoleDashboardPath(role));
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.auth.loginFailed,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/oauth
 */
export function useGoogleLogin() {
  const ns = useAppNameSpace();
  const router = useRouter();
  return useMutation<
    TResponse<AuthSessionResponse>,
    Error,
    Pick<GoogleLoginBody, "credential">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<GoogleLoginBody, "credential">) =>
      AuthService.GoogleLogin(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });

      const data = res.data;
      if (data) {
        // Simpan seluruh token ke cookie — backend hanya mengembalikan token di body.
        setSessionCookies({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.user?.role,
          expiresIn: data.expiresIn,
        });

        const googleEmail = data.user?.email;
        if (googleEmail && typeof window !== "undefined") {
          try {
            const accountInfo = {
              email: googleEmail,
              fullName: data.user?.fullName,
              avatarUrl:
                (data.user as any)?.avatarUrl ||
                (data.user as any)?.profilePhoto,
            };
            localStorage.setItem(
              "simad_remembered_account",
              JSON.stringify(accountInfo),
            );
            localStorage.setItem("simad_last_email", googleEmail);
          } catch {}
        }
      }

      // Redirect sesuai role akun — setiap role punya folder dashboard sendiri.
      const role = res.data?.user?.role;
      router.push(getRoleDashboardPath(role));
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/magic-link/send
 */
export function useSendMagicLink() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<SendMagicLinkBody, "email">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<SendMagicLinkBody, "email">) =>
      AuthService.SendMagicLink(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/magic-link/verify
 */
export function useVerifyMagicLink() {
  const ns = useAppNameSpace();
  const router = useRouter();
  return useMutation<
    TResponse<AuthSessionResponse>,
    Error,
    Pick<VerifyMagicLinkBody, "token">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<VerifyMagicLinkBody, "token">) =>
      AuthService.VerifyMagicLink(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });

      const data = res.data;
      if (data) {
        // Verify magic link setara login — simpan token & role ke cookie.
        setSessionCookies({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.user?.role,
          expiresIn: data.expiresIn,
        });
      }

      // Redirect sesuai role akun.
      const role = res.data?.user?.role;
      router.push(getRoleDashboardPath(role));
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/forgot-password
 */
export function useForgotPassword() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ForgotPasswordBody, "email">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ForgotPasswordBody, "email">) =>
      AuthService.ForgotPassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
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
    Pick<ResetPasswordBody, "token" | "password">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ResetPasswordBody, "token" | "password">) =>
      AuthService.ResetPassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
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
    Pick<RefreshTokenBody, "refreshToken">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<RefreshTokenBody, "refreshToken">) =>
      AuthService.RefreshToken({
        refreshToken: payload?.refreshToken ?? getRefreshToken(),
      }),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });

      // Refresh hanya mengembalikan access token baru — perbarui cookie sesi.
      const data = res.data;
      if (data) {
        setSessionCookies({
          accessToken: data.accessToken,
          expiresIn: data.expiresIn,
        });
      }
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/logout — mengakhiri sesi saat ini, invalidate cache user & sesi.
 */
export function useLogout() {
  const ns = useAppNameSpace();
  const router = useRouter();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<LogoutBody, "refreshToken">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<LogoutBody, "refreshToken">) =>
      AuthService.Logout({
        refreshToken: payload?.refreshToken ?? getRefreshToken(),
      }),

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
        title: res.title,
        message: res.message,
        icon: "success",
      });

      // Hapus cookie sesi lalu kembali ke halaman login.
      clearSessionCookies();
      router.push("/login");
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * POST /auth/logout-all — mengakhiri seluruh sesi, invalidate cache user & sesi.
 */
export function useLogoutAll() {
  const ns = useAppNameSpace();
  const router = useRouter();
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
        title: res.title,
        message: res.message,
        icon: "success",
      });

      clearSessionCookies();
      router.push("/login");
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
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
    Pick<ChangePasswordBody, "currentPassword" | "newPassword">,
    AuthCacheContext
  >({
    mutationFn: (
      payload: Pick<ChangePasswordBody, "currentPassword" | "newPassword">,
    ) => AuthService.ChangePassword(payload),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.authRoot() });
      const previousData = readAuthSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
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
    Pick<ChangeEmailBody, "newEmail" | "password">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ChangeEmailBody, "newEmail" | "password">) =>
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
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
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
    Pick<ChangeEmailVerifyBody, "token">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<ChangeEmailVerifyBody, "token">) =>
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
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

/**
 * DELETE /auth/sessions/:sessionId — daftar sesi berubah, invalidate sessions.
 */
export function useDeleteSession() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<SessionParams, "sessionId">,
    AuthCacheContext
  >({
    mutationFn: (payload: Pick<SessionParams, "sessionId">) =>
      AuthService.DeleteSession(payload),

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
        title: res.title,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: "error",
      });
    },
  });
}

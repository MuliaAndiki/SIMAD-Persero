/**
 * Daftar endpoint modul Auth.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/authRoutes.ts).
 */

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  SEND_VERIFY_EMAIL: "/auth/verify-email/send",
  VERIFY_EMAIL: "/auth/verify-email",
  LOGIN: "/auth/login",
  SEND_MAGIC_LINK: "/auth/magic-link/send",
  VERIFY_MAGIC_LINK: "/auth/magic-link/verify",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",
  ME: "/auth/me",
  CHANGE_PASSWORD: "/auth/change-password",
  CHANGE_EMAIL: "/auth/change-email",
  CHANGE_EMAIL_VERIFY: "/auth/change-email/verify",
  SESSIONS: "/auth/sessions",
  SESSION: (sessionId: string) => `/auth/sessions/${sessionId}`,
} as const;

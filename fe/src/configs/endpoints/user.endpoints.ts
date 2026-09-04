/**
 * Daftar endpoint modul User.
 *
 * Path relatif terhadap base URL API yang dibangun di lapisan fetch
 * (fe/src/api/client/client-http.ts & fe/src/api/server/server-fetch.ts,
 * dari NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_GATE_API + NEXT_PUBLIC_VERSION_API).
 * Disamakan dengan rute backend (be/src/routes/userRoutes.ts).
 */

export const USER_ENDPOINTS = {
  PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",
  UPLOAD_PHOTO: "/users/profile/photo",
  CHANGE_PASSWORD: "/users/change-password",
  DELETE_ACCOUNT: "/users/delete-account",
} as const;

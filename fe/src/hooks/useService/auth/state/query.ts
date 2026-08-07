import { useQuery } from '@tanstack/react-query';

import { queryKey } from '@/configs/query-key';
import AuthService from '@/services/api/auth.service';

/**
 * GET /auth/me — profil pengguna yang sedang login.
 */
export function useMe() {
  return useQuery({
    queryKey: queryKey.auth.me(),

    queryFn: async () => {
      const res = await AuthService.Me();

      return res.data;
    },
  });
}

/**
 * GET /auth/sessions — daftar sesi aktif pengguna.
 */
export function useSessions() {
  return useQuery({
    queryKey: queryKey.auth.sessions(),

    queryFn: async () => {
      const res = await AuthService.Sessions();

      return res.data;
    },
  });
}

import { useAuth } from './auth/useAuth';

/**
 * Single entry point seluruh endpoint frontend.
 *
 * Component hanya berinteraksi dengan `useApi()`:
 *   const api = useApi();
 *
 *   const { data } = api.auth.query.me();
 *   const login = api.auth.mutate.login();
 */
export function useApi() {
  return {
    auth: useAuth(),
  };
}

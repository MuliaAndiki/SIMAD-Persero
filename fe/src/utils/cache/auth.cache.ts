import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { SafeAuthUser } from '@/types/api/auth.types';

export type AuthCacheContext = {
  previousData?: SafeAuthUser;
};

export function readAuthSnapshot(ns: AppNameSpace): SafeAuthUser | undefined {
  return ns.queryClient.getQueryData<SafeAuthUser>(queryKey.auth.me());
}

import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { ProfileResponse } from '@/types/api/user.types';

export type UserCacheContext = {
  previousData?: ProfileResponse;
};

export function readUserSnapshot(ns: AppNameSpace): ProfileResponse | undefined {
  return ns.queryClient.getQueryData<ProfileResponse>(queryKey.user.profile());
}

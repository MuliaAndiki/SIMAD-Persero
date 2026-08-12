import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { ApplicationResponse } from '@/types/api/application.types';

export type ApplicationCacheContext = {
  previousData?: ApplicationResponse[];
};

export function readApplicationSnapshot(ns: AppNameSpace): ApplicationResponse[] | undefined {
  return ns.queryClient.getQueryData<ApplicationResponse[]>(queryKey.application.list());
}

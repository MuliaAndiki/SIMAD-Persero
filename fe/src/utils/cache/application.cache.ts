import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { ApplicationResponse } from '@/types/api/application.types';

export type ApplicationCacheContext = {
  previousData?: ApplicationResponse[];
};

export function readApplicationSnapshot(ns: AppNameSpace): ApplicationResponse[] | undefined {
  const cached = ns.queryClient.getQueryData<any>(queryKey.application.list());
  return cached?.data ?? (Array.isArray(cached) ? cached : undefined);
}

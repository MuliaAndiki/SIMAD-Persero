import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { QuotaItem } from '@/types/api/quota.types';

export type QuotaCacheContext = {
  previousData?: QuotaItem[];
};

export function readQuotaSnapshot(ns: AppNameSpace): QuotaItem[] | undefined {
  return ns.queryClient.getQueryData<QuotaItem[]>(queryKey.quota.list());
}

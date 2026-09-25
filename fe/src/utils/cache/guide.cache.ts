import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { GuideItem } from '@/types/api/guide.types';

export type GuideCacheContext = {
  previousData?: GuideItem[];
};

export function readGuideSnapshot(ns: AppNameSpace): GuideItem[] | undefined {
  return ns.queryClient.getQueryData<GuideItem[]>(queryKey.guide.list());
}

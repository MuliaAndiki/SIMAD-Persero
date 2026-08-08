import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { InternshipResponse } from '@/types/api/internship.types';

export type InternshipCacheContext = {
  previousData?: InternshipResponse[];
};

export function readInternshipSnapshot(ns: AppNameSpace): InternshipResponse[] | undefined {
  return ns.queryClient.getQueryData<InternshipResponse[]>(queryKey.internship.my());
}

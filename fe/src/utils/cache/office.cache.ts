import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { OfficeResponse } from '@/types/api/office.types';

export type OfficeCacheContext = {
  previousData?: OfficeResponse[];
};

export function readOfficeSnapshot(ns: AppNameSpace): OfficeResponse[] | undefined {
  return ns.queryClient.getQueryData<OfficeResponse[]>(queryKey.office.list());
}

import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { DepartmentResponse } from '@/types/api/department.types';

export type DepartmentCacheContext = {
  previousData?: DepartmentResponse[];
};

export function readDepartmentSnapshot(ns: AppNameSpace): DepartmentResponse[] | undefined {
  return ns.queryClient.getQueryData<DepartmentResponse[]>(queryKey.department.list());
}

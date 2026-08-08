import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { DepartmentParams, DepartmentQuery } from '@/types/api/department.types';
import { useQuery } from '@tanstack/react-query';

export function useDepartmentList(query?: DepartmentQuery) {
  return useQuery({
    queryKey: queryKey.department.list(query),
    queryFn: async () => {
      const res = await Api.Department.List(query);
      return res.data;
    },
  });
}

export function useDepartmentDetail(
  params: Pick<DepartmentParams, 'departmentId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.department.detail(params.departmentId),
    queryFn: async () => {
      const res = await Api.Department.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

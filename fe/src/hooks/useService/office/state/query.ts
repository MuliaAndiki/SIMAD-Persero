import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { OfficeParams, OfficeQuery } from '@/types/api/office.types';
import { useQuery } from '@tanstack/react-query';

export function useOfficeList(query?: OfficeQuery) {
  return useQuery({
    queryKey: queryKey.office.list(query),
    queryFn: async () => {
      const res = await Api.Office.List(query);
      return res.data;
    },
  });
}

export function useOfficeDetail(
  params: Pick<OfficeParams, 'officeId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.office.detail(params.officeId),
    queryFn: async () => {
      const res = await Api.Office.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

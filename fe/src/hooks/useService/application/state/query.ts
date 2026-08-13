import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { ApplicationParams, ApplicationQuery } from '@/types/api/application.types';
import { useQuery } from '@tanstack/react-query';

export function useMyApplications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.application.my(),
    queryFn: async () => {
      const res = await Api.Application.MyApplications();
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useApplicationList(query?: ApplicationQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.application.list(query),
    queryFn: async () => {
      const res = await Api.Application.List(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useApplicationDetail(
  params: Pick<ApplicationParams, 'id'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.application.detail(params.id),
    queryFn: async () => {
      const res = await Api.Application.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

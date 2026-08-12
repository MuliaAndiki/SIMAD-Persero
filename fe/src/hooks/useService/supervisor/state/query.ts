import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { SupervisorParams, SupervisorQuery } from '@/types/api/supervisor.types';
import { useQuery } from '@tanstack/react-query';

export function useSupervisorDashboard() {
  return useQuery({
    queryKey: queryKey.supervisor.dashboard(),
    queryFn: async () => {
      const res = await Api.Supervisor.Dashboard();
      return res.data;
    },
  });
}

export function useSupervisorList(query?: SupervisorQuery) {
  return useQuery({
    queryKey: queryKey.supervisor.list(query),
    queryFn: async () => {
      const res = await Api.Supervisor.List(query);
      return res.data;
    },
  });
}

export function useSupervisorDetail(
  params: Pick<SupervisorParams, 'supervisorId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.supervisor.detail(params.supervisorId),
    queryFn: async () => {
      const res = await Api.Supervisor.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

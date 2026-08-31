import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type { ReceptionistParams, ReceptionistQuery } from '@/types/api/receptionist.types';
import { useQuery } from '@tanstack/react-query';

export function useReceptionistList(query?: ReceptionistQuery) {
  return useQuery({
    queryKey: queryKey.receptionist.list(query),
    queryFn: async () => {
      const res = await Api.Receptionist.List(query);
      return res.data;
    },
  });
}

export function useReceptionistDetail(
  params: Pick<ReceptionistParams, 'receptionistId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.receptionist.detail(params.receptionistId),
    queryFn: async () => {
      const res = await Api.Receptionist.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

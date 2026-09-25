import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type { CorrectionQuery } from '@/types/api/correction.types';
import { useQuery } from '@tanstack/react-query';

export function useMyCorrectionList(query?: CorrectionQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.correction.myList(query),
    queryFn: async () => {
      const res = await Api.Correction.MyList(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useSupervisorCorrectionList(
  query?: CorrectionQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.correction.supervisorList(query),
    queryFn: async () => {
      const res = await Api.Correction.SupervisorList(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useCorrectionDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.correction.detail(id),
    queryFn: async () => {
      const res = await Api.Correction.Detail(id);
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

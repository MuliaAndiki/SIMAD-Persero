import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type {
  InstitutionParams,
  InstitutionQuery,
  InstitutionResponse,
} from '@/types/api/institution.types';
import { useQuery } from '@tanstack/react-query';

export function useInstitutionList(query?: InstitutionQuery) {
  return useQuery({
    queryKey: queryKey.institution.list(query),
    queryFn: async () => {
      const res = await Api.Institution.List(query);
      return res.data;
    },
  });
}

export function useInstitutionDetail(
  params: Pick<InstitutionParams, 'institutionId'>,
  options?: { enabled?: boolean },
) {
  return useQuery<InstitutionResponse | null>({
    queryKey: queryKey.institution.detail(params.institutionId),
    queryFn: async () => {
      const res = await Api.Institution.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

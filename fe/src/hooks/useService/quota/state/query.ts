import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type {
  QuotaAvailabilityQuery,
  QuotaQuery,
} from '@/types/api/quota.types';
import { useQuery } from '@tanstack/react-query';

export function useQuotaList(query?: QuotaQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.quota.list(query),
    queryFn: async () => {
      const res = await Api.Quota.List(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useQuotaAvailability(
  query: QuotaAvailabilityQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.quota.availability(query),
    queryFn: async () => {
      const res = await Api.Quota.CheckAvailability(query);
      return res.data;
    },
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!(query.officeLocationId && query.departmentId && query.startDate && query.endDate),
  });
}

export function useQuotaDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.quota.detail(id),
    queryFn: async () => {
      const res = await Api.Quota.Detail(id);
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type { GuideQuery } from '@/types/api/guide.types';
import { useQuery } from '@tanstack/react-query';

export function useGuideList(query?: GuideQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.guide.list(query),
    queryFn: async () => {
      const res = await Api.Guide.List(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useGuideDetail(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.guide.detail(slug),
    queryFn: async () => {
      const res = await Api.Guide.Detail(slug);
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!slug,
  });
}

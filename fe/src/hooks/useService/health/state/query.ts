import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import { useQuery } from '@tanstack/react-query';

export function useHealthPing(options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKey.health.ping(),
    queryFn: async () => {
      const res = await Api.Health.Ping();
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000, // 1 menit
    refetchInterval: options?.refetchInterval ?? 5 * 60 * 1000, // 5 menit untuk menjaga service tetap hangat
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

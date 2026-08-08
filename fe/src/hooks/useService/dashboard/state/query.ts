import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { RecentActivityQuery } from '@/types/api/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useDashboardIntern() {
  return useQuery({
    queryKey: queryKey.dashboard.intern(),
    queryFn: async () => {
      const res = await Api.Dashboard.Intern();
      return res.data;
    },
  });
}

export function useDashboardHr() {
  return useQuery({
    queryKey: queryKey.dashboard.hr(),
    queryFn: async () => {
      const res = await Api.Dashboard.Hr();
      return res.data;
    },
  });
}

export function useDashboardSupervisor() {
  return useQuery({
    queryKey: queryKey.dashboard.supervisor(),
    queryFn: async () => {
      const res = await Api.Dashboard.Supervisor();
      return res.data;
    },
  });
}

export function useDashboardStatistics() {
  return useQuery({
    queryKey: queryKey.dashboard.statistics(),
    queryFn: async () => {
      const res = await Api.Dashboard.Statistics();
      return res.data;
    },
  });
}

export function useCharts() {
  return useQuery({
    queryKey: queryKey.dashboard.charts(),
    queryFn: async () => {
      const res = await Api.Dashboard.Charts();
      return res.data;
    },
  });
}

export function useRecentActivities(query?: RecentActivityQuery) {
  return useQuery({
    queryKey: queryKey.dashboard.recentActivities(query),
    queryFn: async () => {
      const res = await Api.Dashboard.RecentActivities(query);
      return res.data;
    },
  });
}

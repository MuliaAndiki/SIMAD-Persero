import {
  useCharts,
  useDashboardHr,
  useDashboardIntern,
  useDashboardStatistics,
  useDashboardSupervisor,
  useRecentActivities,
} from './state/query';

export const useDashboard = () => {
  return {
    query: {
      intern: useDashboardIntern,
      hr: useDashboardHr,
      supervisor: useDashboardSupervisor,
      statistics: useDashboardStatistics,
      charts: useCharts,
      recentActivities: useRecentActivities,
    },
  };
};

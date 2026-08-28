import {
  useCharts,
  useDashboardHr,
  useDashboardIntern,
  useDashboardReceptionist,
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
      receptionist: useDashboardReceptionist,
      statistics: useDashboardStatistics,
      charts: useCharts,
      recentActivities: useRecentActivities,
    },
  };
};

import {
  useCharts,
  useDashboardHr,
  useDashboardIntern,
  useDashboardReceptionist,
  useDashboardStatistics,
  useDashboardSupervisor,
  useRecentActivities,
  useSupervisorAttendanceTrend,
} from './state/query';

export const useDashboard = () => {
  return {
    query: {
      intern: useDashboardIntern,
      hr: useDashboardHr,
      supervisor: useDashboardSupervisor,
      supervisorAttendanceTrend: useSupervisorAttendanceTrend,
      receptionist: useDashboardReceptionist,
      statistics: useDashboardStatistics,
      charts: useCharts,
      recentActivities: useRecentActivities,
    },
  };
};

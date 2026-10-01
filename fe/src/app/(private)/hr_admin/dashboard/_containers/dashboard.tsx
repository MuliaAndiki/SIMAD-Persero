'use client';

import { HrDashboardSection } from '@/components/page/dashboard/DashboardSection';
import { useApi } from '@/hooks/useService/useApi';
import type { HrDashboardResponse } from '@/types/api/dashboard.types';
import { useMemo } from 'react';

/**
 * Container dashboard HR Admin (orchestration layer).
 *
 * Seluruh fetch API dashboard HR dilakukan di sini: profil (`me`),
 * statistik (GET /hr-admin/dashboard/statistics), grafik (GET /hr-admin/dashboard/charts),
 * dan aktivitas terbaru (GET /hr-admin/dashboard/recent-activities).
 * Ringkasan cepat (5 metrik HR) diturunkan langsung dari data statistik untuk
 * menghindari request ganda dan query berulang (OPT-012).
 * Section hanya presentasi — menerima `state` per blok + `service` aksi.
 */
export default function HrDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const statistics = api.dashboard.query.statistics();
  const charts = api.dashboard.query.charts();
  const recentActivities = api.dashboard.query.recentActivities({ limit: 10 });

  const hrData: HrDashboardResponse | null = useMemo(() => {
    if (!statistics.data) return null;
    return {
      pendingApplications: statistics.data.pendingApplications,
      activeInternships: statistics.data.activeInternships,
      attendanceToday: statistics.data.attendanceToday,
      certificatesGenerated: statistics.data.certificatesGenerated,
      totalSupervisors: statistics.data.totalSupervisors,
    };
  }, [statistics.data]);

  return (
    <HrDashboardSection
      state={{
        userName: me.data?.fullName,
        hr: {
          data: hrData,
          isPending: statistics.isPending,
          isError: statistics.isError,
          errorMessage: statistics.error?.message,
        },
        statistics: {
          data: statistics.data ?? null,
          isPending: statistics.isPending,
          isError: statistics.isError,
          errorMessage: statistics.error?.message,
        },
        charts: {
          data: charts.data ?? null,
          isPending: charts.isPending,
          isError: charts.isError,
          errorMessage: charts.error?.message,
        },
        recentActivities: {
          data: recentActivities.data ?? null,
          isPending: recentActivities.isPending,
          isError: recentActivities.isError,
          errorMessage: recentActivities.error?.message,
        },
      }}
      service={{}}
    />
  );
}

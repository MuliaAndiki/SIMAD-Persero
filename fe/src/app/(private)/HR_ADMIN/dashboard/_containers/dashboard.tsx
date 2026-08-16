"use client";

import { HrDashboardSection } from "@/components/page/dashboard/DashboardSection";
import { useApi } from "@/hooks/useService/useApi";

/**
 * Container dashboard HR Admin (orchestration layer).
 *
 * Seluruh fetch API dashboard HR dilakukan di sini: profil (`me`), ringkasan
 * cepat (GET /hr-admin/dashboard), statistik (GET /hr-admin/dashboard/statistics),
 * grafik (GET /hr-admin/dashboard/charts), dan aktivitas terbaru
 * (GET /hr-admin/dashboard/recent-activities).
 * Section hanya presentasi — menerima `state` per blok + `service` aksi.
 */
export default function HrDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const hr = api.dashboard.query.hr();
  const statistics = api.dashboard.query.statistics();
  const charts = api.dashboard.query.charts();
  const recentActivities = api.dashboard.query.recentActivities({ limit: 10 });

  return (
    <HrDashboardSection
      state={{
        userName: me.data?.fullName,
        hr: {
          data: hr.data ?? null,
          isPending: hr.isPending,
          isError: hr.isError,
          errorMessage: hr.error?.message,
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

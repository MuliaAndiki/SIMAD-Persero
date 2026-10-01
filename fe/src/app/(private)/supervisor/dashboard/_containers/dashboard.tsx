'use client';

import { SupervisorDashboardSection } from '@/components/page/dashboard/DashboardSection';
import { useApi } from '@/hooks/useService/useApi';
import { useMemo } from 'react';

/**
 * Container dashboard supervisor (GET /dashboard/supervisor).
 *
 * Folder `/SUPERVISOR` khusus role ini — halaman lain yang hanya dimiliki
 * supervisor (mis. review absensi peserta) cukup ditambahkan di folder yang
 * sama. Trend 7 hari diturunkan langsung dari dataset 30 hari untuk
 * menghindari request ganda ke server (OPT-012).
 * Seluruh logika, state, & API ada di container; section hanya
 * presentasi (`state` + `service`).
 */
export default function SupervisorDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const supervisor = api.dashboard.query.supervisor();
  const trend30 = api.dashboard.query.supervisorAttendanceTrend({ days: 30 });

  const trend7Data = useMemo(() => {
    if (!trend30.data || !Array.isArray(trend30.data)) return [];
    return trend30.data.slice(-7);
  }, [trend30.data]);

  return (
    <SupervisorDashboardSection
      state={{
        data: supervisor.data ?? null,
        isPending: supervisor.isPending,
        isError: supervisor.isError,
        errorMessage: supervisor.error?.message,
        userName: me.data?.fullName,
        trend7: trend7Data,
        trend30: trend30.data ?? [],
      }}
      service={{}}
    />
  );
}

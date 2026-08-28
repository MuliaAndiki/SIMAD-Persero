'use client';

import { SupervisorDashboardSection } from '@/components/page/dashboard/DashboardSection';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container dashboard supervisor (GET /dashboard/supervisor).
 *
 * Folder `/SUPERVISOR` khusus role ini — halaman lain yang hanya dimiliki
 * supervisor (mis. review absensi peserta) cukup ditambahkan di folder yang
 * sama. Seluruh logika, state, & API ada di container; section hanya
 * presentasi (`state` + `service`).
 */
export default function SupervisorDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const supervisor = api.dashboard.query.supervisor();

  return (
    <SupervisorDashboardSection
      state={{
        data: supervisor.data ?? null,
        isPending: supervisor.isPending,
        isError: supervisor.isError,
        errorMessage: supervisor.error?.message,
        userName: me.data?.fullName,
      }}
      service={{}}
    />
  );
}

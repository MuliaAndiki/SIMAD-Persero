'use client';

import { HrDashboardSection } from '@/components/page/dashboard/DashboardSection';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container dashboard HR Admin (GET /dashboard/hr).
 *
 * Folder `/HR_ADMIN` khusus role ini — halaman lain yang hanya dimiliki HR
 * (mis. kelola pengajuan) cukup ditambahkan di folder yang sama. Seluruh logika,
 * state, & API ada di container; section hanya presentasi (`state` + `service`).
 */
export default function HrDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const hr = api.dashboard.query.hr();

  return (
    <HrDashboardSection
      state={{
        data: hr.data ?? null,
        isPending: hr.isPending,
        isError: hr.isError,
        errorMessage: hr.error?.message,
        userName: me.data?.fullName,
      }}
      service={{}}
    />
  );
}

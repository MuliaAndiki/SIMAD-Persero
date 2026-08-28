'use client';

import { InternDashboardSection } from '@/components/page/dashboard/DashboardSection';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container dashboard intern (GET /dashboard/intern).
 *
 * Folder `/INTERN` khusus role ini — halaman lain yang hanya dimiliki intern
 * (mis. sertifikat) cukup ditambahkan di folder yang sama. Seluruh logika,
 * state, & API ada di container; section hanya presentasi (`state` + `service`).
 */
export default function InternDashboardContainer() {
  const api = useApi();

  const me = api.auth.query.me();
  const intern = api.dashboard.query.intern();

  return (
    <InternDashboardSection
      state={{
        data: intern.data ?? null,
        isPending: intern.isPending,
        isError: intern.isError,
        errorMessage: intern.error?.message,
        userName: me.data?.fullName,
      }}
      service={{}}
    />
  );
}

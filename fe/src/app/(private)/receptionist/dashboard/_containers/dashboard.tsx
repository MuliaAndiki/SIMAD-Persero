'use client';

import { ReceptionistDashboardSection } from '@/components/page/receptionist/ReceptionistDashboardSection';
import { useApi } from '@/hooks/useService/useApi';

export default function ReceptionistDashboardContainer() {
  const api = useApi();
  const dashboard = api.dashboard.query.receptionist();

  return (
    <ReceptionistDashboardSection
      data={dashboard.data}
      isPending={dashboard.isPending}
      isFetching={dashboard.isFetching}
      isError={dashboard.isError}
      errorMessage={dashboard.error?.message}
      onRefresh={() => dashboard.refetch()}
    />
  );
}

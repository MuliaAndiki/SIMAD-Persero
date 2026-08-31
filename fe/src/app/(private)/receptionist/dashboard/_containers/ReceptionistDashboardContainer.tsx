'use client';

import { ReceptionistDashboardSection } from '@/components/page/receptionist/ReceptionistDashboardSection';
import { useApi } from '@/hooks/useService/useApi';

export function ReceptionistDashboardContainer() {
  const api = useApi();
  const { data, isPending, isFetching, isError, error, refetch } = api.dashboard.query.receptionist();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <ReceptionistDashboardSection
      data={data}
      isPending={isPending}
      isFetching={isFetching}
      isError={isError}
      errorMessage={error?.message}
      onRefresh={handleRefresh}
    />
  );
}

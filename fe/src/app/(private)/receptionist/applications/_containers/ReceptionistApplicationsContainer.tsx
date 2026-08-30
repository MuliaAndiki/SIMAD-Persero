'use client';

import { ReceptionistApplicationsSection } from '@/components/page/receptionist/ReceptionistApplicationsSection';
import { useApi } from '@/hooks/useService/useApi';
import type { ApplicationStatusValue } from '@/types/api/application.types';
import { useState } from 'react';

export function ReceptionistApplicationsContainer() {
  const api = useApi();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatusValue | undefined>(undefined);

  const { data, isPending, isFetching, isError, error, refetch } = api.application.query.list({
    limit: 100,
    keyword: search || undefined,
    status: status,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const handleStatusFilter = (newStatus: ApplicationStatusValue | undefined) => {
    setStatus(newStatus);
  };

  return (
    <ReceptionistApplicationsSection
      applications={data ?? []}
      isPending={isPending}
      isFetching={isFetching}
      isError={isError}
      errorMessage={error?.message}
      searchQuery={search}
      statusFilter={status}
      onSearch={handleSearch}
      onStatusFilter={handleStatusFilter}
      onRefresh={refetch}
    />
  );
}

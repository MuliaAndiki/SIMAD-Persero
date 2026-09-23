'use client';

import { ReceptionistApplicationsSection } from '@/components/page/receptionist/ReceptionistApplicationsSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { ApplicationStatusValue } from '@/types/api/application.types';
import { useState } from 'react';

export function ReceptionistApplicationsContainer() {
  const api = useApi();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatusValue | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 2000);

  const { data, isPending, isFetching, isError, error, refetch } = api.application.query.list({
    limit: 100,
    keyword: debouncedSearch || undefined,
    status: status,
  });

  const isSearching = isFetching || search !== debouncedSearch;

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
      isFetching={isSearching}
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

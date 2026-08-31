'use client';

import { ReceptionistInternsSection } from '@/components/page/receptionist/ReceptionistInternsSection';
import { useApi } from '@/hooks/useService/useApi';
import { useState } from 'react';

export function ReceptionistInternsContainer() {
  const api = useApi();
  const [search, setSearch] = useState('');

  const { data, isPending, isFetching, isError, error, refetch } = api.internship.query.list();

  // Filter active interns only and apply search
  const activeInterns = (data ?? [])
    .filter((internship) => internship.status === 'ACTIVE')
    .filter((internship) => {
      if (!search.trim()) return true;
      const queryLower = search.trim().toLowerCase();
      const name = internship.internProfile?.user?.fullName?.toLowerCase() ?? '';
      const email = internship.internProfile?.user?.email?.toLowerCase() ?? '';
      const nim = internship.internProfile?.studentNumber?.toLowerCase() ?? '';
      const deptName = internship.department?.name?.toLowerCase() ?? '';
      const officeName = internship.officeLocation?.name?.toLowerCase() ?? '';
      return (
        name.includes(queryLower) ||
        email.includes(queryLower) ||
        nim.includes(queryLower) ||
        deptName.includes(queryLower) ||
        officeName.includes(queryLower)
      );
    });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  return (
    <ReceptionistInternsSection
      interns={activeInterns}
      isPending={isPending}
      isFetching={isFetching}
      isError={isError}
      errorMessage={error?.message}
      searchQuery={search}
      onSearch={handleSearch}
      onRefresh={refetch}
    />
  );
}

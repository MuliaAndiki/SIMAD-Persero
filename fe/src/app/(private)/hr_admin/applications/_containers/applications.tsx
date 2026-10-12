'use client';

import { ApplicationsSection } from '@/components/page/hr/ApplicationsSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { ApplicationResponse, ApplicationStatusValue } from '@/types/api/application.types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

/**
 * Container halaman Pengajuan Magang (HR Admin) — daftar + filter.
 * Review/approve/reject ditangani di halaman detail (/hr_admin/applications/[id]).
 */
export default function HrApplicationsContainer() {
  const api = useApi();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const debouncedKeyword = useDebounce(keyword, 2000);

  const list = api.application.query.list({
    status: (statusFilter || undefined) as ApplicationStatusValue | undefined,
    keyword: debouncedKeyword || undefined,
    limit: 100,
  });

  const isSearching = list.isFetching || keyword !== debouncedKeyword;

  const handleSelectApplication = useCallback(
    (id: string) => {
      router.push(`/hr_admin/applications/${id}`);
    },
    [router],
  );

  const handleReviewApplication = useCallback(
    (app: ApplicationResponse) => {
      router.push(`/hr_admin/applications/${app.id}`);
    },
    [router],
  );

  const applications = (list.data?.data ??
    (Array.isArray(list.data) ? list.data : [])) as ApplicationResponse[];

  return (
    <ApplicationsSection
      state={{
        isPending: list.isPending,
        isFetching: isSearching,
        isError: list.isError,
        errorMessage: list.error?.message,
        applications,
        statusFilter,
        keyword,
      }}
      actions={{
        onStatusChange: setStatusFilter,
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onSelectApplication: handleSelectApplication,
        onReviewApplication: handleReviewApplication,
      }}
    />
  );
}

'use client';

import { ApplicationDetailSection } from '@/components/page/application/ApplicationDetailSection';
import { useApi } from '@/hooks/useService/useApi';

export interface ApplicationDetailContainerProps {
  applicationId: string;
}

/**
 * Container halaman detail aplikasi (dynamic route `[id]`).
 * Orchestration layer: fetch detail by id via React Query, lalu render
 * ApplicationDetailSection (presentasional) dengan props.
 */
export default function ApplicationDetailContainer({
  applicationId,
}: ApplicationDetailContainerProps) {
  const api = useApi();

  const detail = api.application.query.detail(
    { id: applicationId },
    { enabled: Boolean(applicationId) },
  );

  return (
    <ApplicationDetailSection
      state={{
        isPending: detail.isPending,
        isError: detail.isError,
        errorMessage: detail.error?.message,
        application: detail.data ?? undefined,
      }}
    />
  );
}

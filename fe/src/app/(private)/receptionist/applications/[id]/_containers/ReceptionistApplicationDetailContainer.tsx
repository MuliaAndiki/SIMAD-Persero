'use client';

import { ReceptionistApplicationDetailSection } from '@/components/page/receptionist/ReceptionistApplicationDetailSection';
import { useApi } from '@/hooks/useService/useApi';

interface ReceptionistApplicationDetailContainerProps {
  applicationId: string;
}

export function ReceptionistApplicationDetailContainer({
  applicationId,
}: ReceptionistApplicationDetailContainerProps) {
  const api = useApi();
  const { data, isPending, isError, error } = api.application.query.detail(
    { id: applicationId },
    { enabled: Boolean(applicationId) }
  );

  return (
    <ReceptionistApplicationDetailSection
      application={data ?? undefined}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
    />
  );
}

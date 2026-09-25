'use client';

import { AttendanceCorrectionSection } from '@/components/page/supervisor/AttendanceCorrectionSection';
import { useApi } from '@/hooks/useService/useApi';
import { useCallback } from 'react';

export default function SupervisorCorrectionsContainer() {
  const api = useApi();

  const correctionsQuery = api.correction.query.supervisorList();
  const approveMutation = api.correction.mutate.approve();
  const rejectMutation = api.correction.mutate.reject();

  const handleApprove = useCallback(
    async (id: string, supervisorNotes?: string) => {
      await approveMutation.mutateAsync({
        id,
        body: { supervisorNotes },
      });
      await correctionsQuery.refetch();
    },
    [approveMutation, correctionsQuery],
  );

  const handleReject = useCallback(
    async (id: string, supervisorNotes: string) => {
      await rejectMutation.mutateAsync({
        id,
        body: { supervisorNotes },
      });
      await correctionsQuery.refetch();
    },
    [rejectMutation, correctionsQuery],
  );

  return (
    <AttendanceCorrectionSection
      corrections={correctionsQuery.data ?? []}
      isPending={correctionsQuery.isPending}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}

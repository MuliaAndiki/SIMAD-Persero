'use client';

import { EvaluationsSection } from '@/components/page/supervisor/EvaluationsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { SaveEvaluationBody } from '@/types/api/evaluation.types';
import { useCallback } from 'react';

export default function SupervisorEvaluationsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const internsQuery = api.supervisor.query.list();
  const saveDraftMutation = api.evaluation.mutate.saveDraft();
  const submitFinalMutation = api.evaluation.mutate.submitFinal();

  const handleSaveDraft = useCallback(
    async (internshipId: string, body: SaveEvaluationBody) => {
      await saveDraftMutation.mutateAsync({ internshipId, body });
      await internsQuery.refetch();
    },
    [saveDraftMutation, internsQuery],
  );

  const handleSubmitFinal = useCallback(
    async (internshipId: string, body: SaveEvaluationBody) => {
      const confirmed = await ns.alert.confirm({
        title: 'Finalisasi Nilai Evaluasi?',
        deskripsi: 'Setelah difinalisasi, nilai tidak dapat diubah kembali dan akan langsung masuk ke antrean persetujuan sertifikat HR Admin.',
        confirmButtonText: 'Ya, Finalisasi Nilai',
        icon: 'warning',
      });
      if (!confirmed) return;

      await submitFinalMutation.mutateAsync({ internshipId, body });
      await internsQuery.refetch();
    },
    [submitFinalMutation, internsQuery, ns.alert],
  );

  return (
    <EvaluationsSection
      internships={internsQuery.data ?? []}
      isPending={internsQuery.isPending}
      onSaveDraft={handleSaveDraft}
      onSubmitFinal={handleSubmitFinal}
    />
  );
}

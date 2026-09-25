'use client';

import { EvaluationsOverviewSection } from '@/components/page/hr/EvaluationsOverviewSection';
import { useApi } from '@/hooks/useService/useApi';

export default function HrEvaluationsContainer() {
  const api = useApi();
  const evaluationsQuery = api.evaluation.query.hrList();

  return (
    <EvaluationsOverviewSection
      evaluations={evaluationsQuery.data ?? []}
      isPending={evaluationsQuery.isPending}
    />
  );
}

import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { EvaluationItem } from '@/types/api/evaluation.types';

export type EvaluationCacheContext = {
  previousData?: EvaluationItem[];
};

export function readEvaluationSnapshot(
  ns: AppNameSpace,
): EvaluationItem[] | undefined {
  return ns.queryClient.getQueryData<EvaluationItem[]>(
    queryKey.evaluation.hrList(),
  );
}

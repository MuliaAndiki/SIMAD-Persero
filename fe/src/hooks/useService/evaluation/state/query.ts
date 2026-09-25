import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type { EvaluationQuery } from '@/types/api/evaluation.types';
import { useQuery } from '@tanstack/react-query';

export function useEvaluationByInternship(internshipId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.evaluation.byInternship(internshipId),
    queryFn: async () => {
      const res = await Api.Evaluation.GetByInternship(internshipId);
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!internshipId,
  });
}

export function useHrEvaluationList(query?: EvaluationQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.evaluation.hrList(query),
    queryFn: async () => {
      const res = await Api.Evaluation.HrList(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type {
  EvaluationItem,
  SaveEvaluationBody,
} from '@/types/api/evaluation.types';
import {
  type EvaluationCacheContext,
  readEvaluationSnapshot,
} from '@/utils/cache/evaluation.cache';

export function useSaveEvaluationDraft() {
  return useAppMutation<
    EvaluationItem,
    { internshipId: string; body: SaveEvaluationBody },
    EvaluationCacheContext
  >({
    mutationFn: ({ internshipId, body }) => Api.Evaluation.SaveDraft(internshipId, body),
    invalidateKeys: [queryKey.evaluationRoot()],
    optimistic: (ns) => ({ previousData: readEvaluationSnapshot(ns) }),
  });
}

export function useUpdateEvaluationDraft() {
  return useAppMutation<
    EvaluationItem,
    { internshipId: string; body: SaveEvaluationBody },
    EvaluationCacheContext
  >({
    mutationFn: ({ internshipId, body }) => Api.Evaluation.UpdateDraft(internshipId, body),
    invalidateKeys: [queryKey.evaluationRoot()],
    optimistic: (ns) => ({ previousData: readEvaluationSnapshot(ns) }),
  });
}

export function useSubmitFinalEvaluation() {
  return useAppMutation<
    EvaluationItem,
    { internshipId: string; body: SaveEvaluationBody },
    EvaluationCacheContext
  >({
    mutationFn: ({ internshipId, body }) => Api.Evaluation.SubmitFinal(internshipId, body),
    invalidateKeys: [queryKey.evaluationRoot()],
    optimistic: (ns) => ({ previousData: readEvaluationSnapshot(ns) }),
  });
}

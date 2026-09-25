import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type {
  ApproveCorrectionBody,
  AttendanceCorrectionItem,
  CreateCorrectionBody,
  RejectCorrectionBody,
} from '@/types/api/correction.types';
import {
  type CorrectionCacheContext,
  readCorrectionSnapshot,
} from '@/utils/cache/correction.cache';

export function useSubmitCorrection() {
  return useAppMutation<AttendanceCorrectionItem, CreateCorrectionBody, CorrectionCacheContext>({
    mutationFn: (body) => Api.Correction.Submit(body),
    invalidateKeys: [queryKey.correctionRoot(), queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readCorrectionSnapshot(ns) }),
  });
}

export function useApproveCorrection() {
  return useAppMutation<
    { correction: AttendanceCorrectionItem; attendance: any },
    { id: string; body: ApproveCorrectionBody },
    CorrectionCacheContext
  >({
    mutationFn: ({ id, body }) => Api.Correction.Approve(id, body),
    invalidateKeys: [queryKey.correctionRoot(), queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readCorrectionSnapshot(ns) }),
  });
}

export function useRejectCorrection() {
  return useAppMutation<
    AttendanceCorrectionItem,
    { id: string; body: RejectCorrectionBody },
    CorrectionCacheContext
  >({
    mutationFn: ({ id, body }) => Api.Correction.Reject(id, body),
    invalidateKeys: [queryKey.correctionRoot(), queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readCorrectionSnapshot(ns) }),
  });
}

export function useCancelCorrection() {
  return useAppMutation<AttendanceCorrectionItem, string, CorrectionCacheContext>({
    mutationFn: (id) => Api.Correction.Cancel(id),
    invalidateKeys: [queryKey.correctionRoot(), queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readCorrectionSnapshot(ns) }),
  });
}

import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type {
  CreateQuotaBody,
  QuotaItem,
  UpdateQuotaBody,
} from '@/types/api/quota.types';
import { type QuotaCacheContext, readQuotaSnapshot } from '@/utils/cache/quota.cache';

export function useCreateQuota() {
  return useAppMutation<QuotaItem, CreateQuotaBody, QuotaCacheContext>({
    mutationFn: (body) => Api.Quota.Create(body),
    invalidateKeys: [queryKey.quotaRoot()],
    optimistic: (ns) => ({ previousData: readQuotaSnapshot(ns) }),
  });
}

export function useUpdateQuota() {
  return useAppMutation<QuotaItem, { id: string; body: UpdateQuotaBody }, QuotaCacheContext>({
    mutationFn: ({ id, body }) => Api.Quota.Update(id, body),
    invalidateKeys: [queryKey.quotaRoot()],
    optimistic: (ns) => ({ previousData: readQuotaSnapshot(ns) }),
  });
}

export function useDeleteQuota() {
  return useAppMutation<null, string, QuotaCacheContext>({
    mutationFn: (id) => Api.Quota.Delete(id),
    invalidateKeys: [queryKey.quotaRoot()],
    optimistic: (ns) => ({ previousData: readQuotaSnapshot(ns) }),
  });
}

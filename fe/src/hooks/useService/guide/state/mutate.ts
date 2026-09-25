import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type {
  CreateGuideBody,
  GuideItem,
  UpdateGuideBody,
} from '@/types/api/guide.types';
import { type GuideCacheContext, readGuideSnapshot } from '@/utils/cache/guide.cache';

export function useCreateGuide() {
  return useAppMutation<GuideItem, CreateGuideBody, GuideCacheContext>({
    mutationFn: (body) => Api.Guide.Create(body),
    invalidateKeys: [queryKey.guideRoot()],
    optimistic: (ns) => ({ previousData: readGuideSnapshot(ns) }),
  });
}

export function useUpdateGuide() {
  return useAppMutation<
    GuideItem,
    { id: string; body: UpdateGuideBody },
    GuideCacheContext
  >({
    mutationFn: ({ id, body }) => Api.Guide.Update(id, body),
    invalidateKeys: [queryKey.guideRoot()],
    optimistic: (ns) => ({ previousData: readGuideSnapshot(ns) }),
  });
}

export function useDeleteGuide() {
  return useAppMutation<null, string, GuideCacheContext>({
    mutationFn: (id) => Api.Guide.Delete(id),
    invalidateKeys: [queryKey.guideRoot()],
    optimistic: (ns) => ({ previousData: readGuideSnapshot(ns) }),
  });
}

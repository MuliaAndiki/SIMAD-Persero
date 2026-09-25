import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import { type OfficeCacheContext, readOfficeSnapshot } from '@/utils/cache/office.cache';

import type {
  CreateOfficeBody,
  OfficeParams,
  OfficeResponse,
  UpdateOfficeBody,
} from '@/types/api/office.types';

export function useCreateOffice() {
  return useAppMutation<
    OfficeResponse,
    Pick<
      CreateOfficeBody,
      'name' | 'address' | 'latitude' | 'longitude' | 'radiusMeter' | 'departmentIds'
    >,
    OfficeCacheContext
  >({
    mutationFn: (body) => Api.Office.Create(body),
    invalidateKeys: [queryKey.officeRoot()],
    optimistic: (ns) => ({ previousData: readOfficeSnapshot(ns) }),
  });
}

export function useUpdateOffice() {
  return useAppMutation<
    OfficeResponse,
    { params: Pick<OfficeParams, 'officeId'>; body: UpdateOfficeBody },
    OfficeCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Office.Update(params, body),
    invalidateKeys: [queryKey.officeRoot()],
    optimistic: (ns) => ({ previousData: readOfficeSnapshot(ns) }),
  });
}

export function useDeleteOffice() {
  return useAppMutation<null, Pick<OfficeParams, 'officeId'>, OfficeCacheContext>({
    mutationFn: (params) => Api.Office.Delete(params),
    invalidateKeys: [queryKey.officeRoot()],
    optimistic: (ns) => ({ previousData: readOfficeSnapshot(ns) }),
  });
}

import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import { type OfficeCacheContext, readOfficeSnapshot } from '@/utils/cache/office.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type {
  CreateOfficeBody,
  OfficeParams,
  OfficeResponse,
  UpdateOfficeBody,
} from '@/types/api/office.types';
import { useMutation } from '@tanstack/react-query';

export function useCreateOffice() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<OfficeResponse>,
    Error,
    Pick<
      CreateOfficeBody,
      'name' | 'address' | 'latitude' | 'longitude' | 'radiusMeter' | 'departmentIds'
    >,
    OfficeCacheContext
  >({
    mutationFn: (
      body: Pick<
        CreateOfficeBody,
        'name' | 'address' | 'latitude' | 'longitude' | 'radiusMeter' | 'departmentIds'
      >,
    ) => Api.Office.Create(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.officeRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.officeRoot() });
      const previousData = readOfficeSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useUpdateOffice() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<OfficeResponse>,
    Error,
    { params: Pick<OfficeParams, 'officeId'>; body: UpdateOfficeBody },
    OfficeCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<OfficeParams, 'officeId'>;
      body: UpdateOfficeBody;
    }) => Api.Office.Update(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.officeRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.officeRoot() });
      const previousData = readOfficeSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useDeleteOffice() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<OfficeParams, 'officeId'>, OfficeCacheContext>({
    mutationFn: (params: Pick<OfficeParams, 'officeId'>) => Api.Office.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.officeRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.officeRoot() });
      const previousData = readOfficeSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

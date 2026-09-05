import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type DepartmentCacheContext,
  readDepartmentSnapshot,
} from '@/utils/cache/department.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type {
  CreateDepartmentBody,
  DepartmentParams,
  DepartmentResponse,
  UpdateDepartmentBody,
} from '@/types/api/department.types';
import { useMutation } from '@tanstack/react-query';

export function useCreateDepartment() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<DepartmentResponse>,
    Error,
    Pick<CreateDepartmentBody, 'code' | 'name' | 'description'>,
    DepartmentCacheContext
  >({
    mutationFn: (body: Pick<CreateDepartmentBody, 'code' | 'name' | 'description'>) =>
      Api.Department.Create(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.departmentRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.departmentRoot() });
      const previousData = readDepartmentSnapshot(ns);
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

export function useUpdateDepartment() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<DepartmentResponse>,
    Error,
    { params: Pick<DepartmentParams, 'departmentId'>; body: UpdateDepartmentBody },
    DepartmentCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<DepartmentParams, 'departmentId'>;
      body: UpdateDepartmentBody;
    }) => Api.Department.Update(params, body),
    onSettled: async (_, __, _variables) => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.departmentRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.departmentRoot() });
      const previousData = readDepartmentSnapshot(ns);
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

export function useDeleteDepartment() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<DepartmentParams, 'departmentId'>,
    DepartmentCacheContext
  >({
    mutationFn: (params: Pick<DepartmentParams, 'departmentId'>) => Api.Department.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.departmentRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.departmentRoot() });
      const previousData = readDepartmentSnapshot(ns);
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

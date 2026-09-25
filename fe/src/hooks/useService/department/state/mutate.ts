import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import {
  type DepartmentCacheContext,
  readDepartmentSnapshot,
} from '@/utils/cache/department.cache';

import type {
  CreateDepartmentBody,
  DepartmentParams,
  DepartmentResponse,
  UpdateDepartmentBody,
} from '@/types/api/department.types';

export function useCreateDepartment() {
  return useAppMutation<
    DepartmentResponse,
    Pick<CreateDepartmentBody, 'code' | 'name' | 'description'>,
    DepartmentCacheContext
  >({
    mutationFn: (body) => Api.Department.Create(body),
    invalidateKeys: [queryKey.departmentRoot()],
    optimistic: (ns) => ({ previousData: readDepartmentSnapshot(ns) }),
  });
}

export function useUpdateDepartment() {
  return useAppMutation<
    DepartmentResponse,
    { params: Pick<DepartmentParams, 'departmentId'>; body: UpdateDepartmentBody },
    DepartmentCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Department.Update(params, body),
    invalidateKeys: [queryKey.departmentRoot()],
    optimistic: (ns) => ({ previousData: readDepartmentSnapshot(ns) }),
  });
}

export function useDeleteDepartment() {
  return useAppMutation<null, Pick<DepartmentParams, 'departmentId'>, DepartmentCacheContext>({
    mutationFn: (params) => Api.Department.Delete(params),
    invalidateKeys: [queryKey.departmentRoot()],
    optimistic: (ns) => ({ previousData: readDepartmentSnapshot(ns) }),
  });
}

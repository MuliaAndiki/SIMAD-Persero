import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import {
  type SupervisorCacheContext,
  readSupervisorSnapshot,
} from '@/utils/cache/supervisor.cache';

import type { IUser } from '@/types/api/model.type';
import type {
  AssignInternBody,
  CreateSupervisorBody,
  SupervisorAssignmentParams,
  SupervisorAssignmentResponse,
  SupervisorParams,
  UpdateSupervisorBody,
} from '@/types/api/supervisor.types';

export function useAssignIntern() {
  return useAppMutation<
    SupervisorAssignmentResponse,
    {
      params: Pick<SupervisorParams, 'supervisorId'>;
      body: Pick<AssignInternBody, 'internshipId'>;
    },
    SupervisorCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Supervisor.Assign(params, body),
    invalidateKeys: [queryKey.supervisorRoot(), queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readSupervisorSnapshot(ns) }),
  });
}

export function useCreateSupervisor() {
  return useAppMutation<IUser, CreateSupervisorBody, SupervisorCacheContext>({
    mutationFn: (body) => Api.Supervisor.Create(body),
    invalidateKeys: [queryKey.supervisorRoot()],
    optimistic: (ns) => ({ previousData: readSupervisorSnapshot(ns) }),
  });
}

export function useUpdateSupervisor() {
  return useAppMutation<
    IUser,
    {
      params: Pick<SupervisorParams, 'supervisorId'>;
      body: UpdateSupervisorBody;
    },
    SupervisorCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Supervisor.Update(params, body),
    invalidateKeys: [queryKey.supervisorRoot()],
    optimistic: (ns) => ({ previousData: readSupervisorSnapshot(ns) }),
  });
}

export function useDeleteSupervisor() {
  return useAppMutation<null, Pick<SupervisorParams, 'supervisorId'>, SupervisorCacheContext>({
    mutationFn: (params) => Api.Supervisor.Delete(params),
    invalidateKeys: [queryKey.supervisorRoot()],
    optimistic: (ns) => ({ previousData: readSupervisorSnapshot(ns) }),
  });
}

export function useRemoveAssignment() {
  return useAppMutation<
    null,
    Pick<SupervisorAssignmentParams, 'supervisorId' | 'assignmentId'>,
    SupervisorCacheContext
  >({
    mutationFn: (params) => Api.Supervisor.RemoveAssignment(params),
    invalidateKeys: [queryKey.supervisorRoot(), queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readSupervisorSnapshot(ns) }),
  });
}

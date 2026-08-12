import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { SupervisorAssignmentResponse } from '@/types/api/supervisor.types';

export type SupervisorCacheContext = {
  previousData?: SupervisorAssignmentResponse[];
};

export function readSupervisorSnapshot(
  ns: AppNameSpace,
): SupervisorAssignmentResponse[] | undefined {
  return ns.queryClient.getQueryData<SupervisorAssignmentResponse[]>(queryKey.supervisor.list());
}

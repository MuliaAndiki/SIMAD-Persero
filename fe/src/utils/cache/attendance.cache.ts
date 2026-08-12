import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { AttendanceResponse } from '@/types/api/attendance.types';

export type AttendanceCacheContext = {
  previousData?: AttendanceResponse[];
};

export function readAttendanceSnapshot(ns: AppNameSpace): AttendanceResponse[] | undefined {
  return ns.queryClient.getQueryData<AttendanceResponse[]>(queryKey.attendance.history());
}

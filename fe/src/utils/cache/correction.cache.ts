import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { AttendanceCorrectionItem } from '@/types/api/correction.types';

export type CorrectionCacheContext = {
  previousData?: AttendanceCorrectionItem[];
};

export function readCorrectionSnapshot(
  ns: AppNameSpace,
): AttendanceCorrectionItem[] | undefined {
  return ns.queryClient.getQueryData<AttendanceCorrectionItem[]>(
    queryKey.correction.myList(),
  );
}

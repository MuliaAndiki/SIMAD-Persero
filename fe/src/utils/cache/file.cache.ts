import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { FileResponse } from '@/types/api/file.types';

export type FileCacheContext = {
  previousData?: FileResponse[];
};

export function readFileSnapshot(ns: AppNameSpace): FileResponse[] | undefined {
  return ns.queryClient.getQueryData<FileResponse[]>(queryKey.fileRoot());
}

import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { FileParams } from '@/types/api/file.types';
import { useQuery } from '@tanstack/react-query';

export function useFileDetail(params: Pick<FileParams, 'fileId'>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.file.detail(params.fileId),
    queryFn: async () => {
      const res = await Api.File.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

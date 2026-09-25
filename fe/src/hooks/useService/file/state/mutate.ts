import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import { type FileCacheContext, readFileSnapshot } from '@/utils/cache/file.cache';
import { ResponseTitles } from '@/utils/response-titles';
import { useMutation } from '@tanstack/react-query';

import type { FileParams, FileResponse } from '@/types/api/file.types';

export function useUploadFile() {
  return useAppMutation<
    FileResponse,
    FormData | { url: string; originalName?: string; mimeType?: string; size?: number },
    FileCacheContext
  >({
    mutationFn: (payload) => Api.File.Upload(payload),
    invalidateKeys: [queryKey.fileRoot()],
    optimistic: (ns) => ({ previousData: readFileSnapshot(ns) }),
  });
}

export function useDeleteFile() {
  return useAppMutation<null, Pick<FileParams, 'fileId'>, FileCacheContext>({
    mutationFn: (params) => Api.File.Delete(params),
    invalidateKeys: [queryKey.fileRoot()],
    optimistic: (ns) => ({ previousData: readFileSnapshot(ns) }),
  });
}

/**
 * Karena mengembalikan data binary, kita letakkan di mutation
 * agar mudah men-trigger loading state saat proses download.
 */
export function useDownloadFile() {
  const ns = useAppNameSpace();
  return useMutation<Response, Error, Pick<FileParams, 'fileId'>, FileCacheContext>({
    mutationFn: (params) => Api.File.Download(params),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.fileRoot() });
      const previousData = readFileSnapshot(ns);
      return { previousData };
    },
    onSuccess: () => {
      ns.alert.toast({
        title: ResponseTitles.file.downloaded,
        message: 'File berhasil diunduh',
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

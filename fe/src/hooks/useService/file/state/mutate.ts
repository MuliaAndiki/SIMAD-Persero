import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import { type FileCacheContext, readFileSnapshot } from '@/utils/cache/file.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type { FileParams, FileResponse } from '@/types/api/file.types';
import { useMutation } from '@tanstack/react-query';

export function useUploadFile() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<FileResponse>,
    Error,
    FormData | { url: string; originalName?: string; mimeType?: string; size?: number },
    FileCacheContext
  >({
    mutationFn: (payload) => Api.File.Upload(payload),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.fileRoot() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.fileRoot() });
      const previousData = readFileSnapshot(ns);
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

export function useDeleteFile() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<FileParams, 'fileId'>, FileCacheContext>({
    mutationFn: (params: Pick<FileParams, 'fileId'>) => Api.File.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({ queryKey: queryKey.fileRoot() });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.fileRoot() });
      const previousData = readFileSnapshot(ns);
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

/**
 * Karena mengembalikan data binary, kita letakkan di mutation
 * agar mudah men-trigger loading state saat proses download.
 */
export function useDownloadFile() {
  const ns = useAppNameSpace();
  return useMutation<Response, Error, Pick<FileParams, 'fileId'>, FileCacheContext>({
    mutationFn: (params: Pick<FileParams, 'fileId'>) => Api.File.Download(params),
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

import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type CertificateCacheContext,
  readCertificateSnapshot,
} from '@/utils/cache/certificate.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type {
  CertificateParams,
  CertificateResponse,
  GenerateCertificateBody,
} from '@/types/api/certificate.types';
import { useMutation } from '@tanstack/react-query';

export function useGenerateCertificate() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<CertificateResponse>,
    Error,
    Pick<GenerateCertificateBody, 'internshipId'>,
    CertificateCacheContext
  >({
    mutationFn: (body: Pick<GenerateCertificateBody, 'internshipId'>) =>
      Api.Certificate.Generate(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.certificateRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.certificateRoot() });
      const previousData = readCertificateSnapshot(ns);
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

export function useRegenerateCertificate() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<CertificateResponse>,
    Error,
    Pick<CertificateParams, 'certificateId'>,
    CertificateCacheContext
  >({
    mutationFn: (params: Pick<CertificateParams, 'certificateId'>) =>
      Api.Certificate.Regenerate(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.certificateRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.certificateRoot() });
      const previousData = readCertificateSnapshot(ns);
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

export function useDownloadCertificate() {
  const ns = useAppNameSpace();
  return useMutation<
    Response,
    Error,
    Pick<CertificateParams, 'certificateId'>,
    CertificateCacheContext
  >({
    mutationFn: (params: Pick<CertificateParams, 'certificateId'>) =>
      Api.Certificate.Download(params),
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.certificateRoot() });
      const previousData = readCertificateSnapshot(ns);
      return { previousData };
    },
    onSuccess: () => {
      ns.alert.toast({
        title: ResponseTitles.success,
        message: 'Downloaded successfully',
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

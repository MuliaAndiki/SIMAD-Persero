import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import {
  type CertificateCacheContext,
  readCertificateSnapshot,
} from '@/utils/cache/certificate.cache';
import { ResponseTitles } from '@/utils/response-titles';
import { useMutation } from '@tanstack/react-query';

import type {
  CertificateParams,
  CertificateResponse,
  CertificateSettingsResponse,
  GenerateCertificateBody,
  UpdateCertificateSettingsBody,
} from '@/types/api/certificate.types';

export function useGenerateCertificate() {
  return useAppMutation<
    CertificateResponse,
    Pick<GenerateCertificateBody, 'internshipId'>,
    CertificateCacheContext
  >({
    mutationFn: (body) => Api.Certificate.Generate(body),
    invalidateKeys: [queryKey.certificateRoot()],
    optimistic: (ns) => ({ previousData: readCertificateSnapshot(ns) }),
  });
}

export function useRegenerateCertificate() {
  return useAppMutation<
    CertificateResponse,
    Pick<CertificateParams, 'certificateId'>,
    CertificateCacheContext
  >({
    mutationFn: (params) => Api.Certificate.Regenerate(params),
    invalidateKeys: [queryKey.certificateRoot()],
    optimistic: (ns) => ({ previousData: readCertificateSnapshot(ns) }),
  });
}

export function useSaveCertificateSettings() {
  return useAppMutation<CertificateSettingsResponse, UpdateCertificateSettingsBody>({
    mutationFn: (body) => Api.Certificate.SaveSettings(body),
    invalidateKeys: [queryKey.certificate.settings()],
  });
}

export function useDownloadCertificate() {
  const ns = useAppNameSpace();
  return useMutation<Response, Error, Pick<CertificateParams, 'certificateId'>>({
    mutationFn: (params) => Api.Certificate.Download(params),
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

export function useDownloadMyCertificate() {
  const ns = useAppNameSpace();
  return useMutation<Response, Error, void>({
    mutationFn: () => Api.Certificate.DownloadMy(),
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

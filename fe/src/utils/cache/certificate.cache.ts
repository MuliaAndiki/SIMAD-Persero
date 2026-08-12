import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { CertificateResponse } from '@/types/api/certificate.types';

export type CertificateCacheContext = {
  previousData?: CertificateResponse[];
};

export function readCertificateSnapshot(ns: AppNameSpace): CertificateResponse[] | undefined {
  return ns.queryClient.getQueryData<CertificateResponse[]>(queryKey.certificate.my());
}

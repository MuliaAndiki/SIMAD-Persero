import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { CertificateParams, CertificateVerifyParams } from '@/types/api/certificate.types';
import { useQuery } from '@tanstack/react-query';

export function useVerifyCertificate(
  params: Pick<CertificateVerifyParams, 'verificationCode'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.certificate.verify(params.verificationCode),
    queryFn: async () => {
      const res = await Api.Certificate.Verify(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useMyCertificate() {
  return useQuery({
    queryKey: queryKey.certificate.my(),
    queryFn: async () => {
      const res = await Api.Certificate.My();
      return res.data;
    },
  });
}

export function useCertificateDetail(
  params: Pick<CertificateParams, 'certificateId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.certificate.detail(params.certificateId),
    queryFn: async () => {
      const res = await Api.Certificate.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type {
  CertificateParams,
  CertificateQuery,
  CertificateVerifyParams,
} from '@/types/api/certificate.types';
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

export function useCertificateList(query?: CertificateQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.certificate.list(query),
    queryFn: async () => {
      const res = await Api.Certificate.List(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function usePendingCertificateApprovals(
  query?: CertificateQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.certificate.pendingApprovals(query),
    queryFn: async () => {
      const res = await Api.Certificate.PendingApprovals(query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useOfficeCertificateSettingsList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey.certificate.officeSettings(),
    queryFn: async () => {
      const res = await Api.Certificate.ListOfficeSettings();
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useOfficeCertificateSettingDetail(
  officeLocationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.certificate.officeSetting(officeLocationId),
    queryFn: async () => {
      const res = await Api.Certificate.GetOfficeSetting(officeLocationId);
      return res.data;
    },
    enabled: options?.enabled && !!officeLocationId,
  });
}

export function useCertificateSettings() {
  return useQuery({
    queryKey: queryKey.certificate.settings(),
    queryFn: async () => {
      const res = await Api.Certificate.GetSettings();
      return res.data;
    },
  });
}




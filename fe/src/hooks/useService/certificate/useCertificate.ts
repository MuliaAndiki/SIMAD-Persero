import {
  useDownloadCertificate,
  useGenerateCertificate,
  useRegenerateCertificate,
} from './state/mutate';
import { useCertificateDetail, useMyCertificate, useVerifyCertificate } from './state/query';

export const useCertificate = () => {
  return {
    query: {
      verify: useVerifyCertificate,
      my: useMyCertificate,
      detail: useCertificateDetail,
    },
    mutate: {
      generate: useGenerateCertificate,
      download: useDownloadCertificate,
      regenerate: useRegenerateCertificate,
    },
  };
};

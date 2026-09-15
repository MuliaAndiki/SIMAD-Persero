import {
  useDownloadCertificate,
  useDownloadMyCertificate,
  useGenerateCertificate,
  useRegenerateCertificate,
  useSaveCertificateSettings,
} from './state/mutate';
import {
  useCertificateDetail,
  useCertificateSettings,
  useMyCertificate,
  useVerifyCertificate,
} from './state/query';

export const useCertificate = () => {
  return {
    query: {
      verify: useVerifyCertificate,
      my: useMyCertificate,
      detail: useCertificateDetail,
      settings: useCertificateSettings,
    },
    mutate: {
      generate: useGenerateCertificate,
      download: useDownloadCertificate,
      downloadMine: useDownloadMyCertificate,
      regenerate: useRegenerateCertificate,
      saveSettings: useSaveCertificateSettings,
    },
  };
};

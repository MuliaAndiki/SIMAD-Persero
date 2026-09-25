import {
  useApproveCertificate,
  useCreateOfficeCertificateSetting,
  useDownloadCertificate,
  useDownloadMyCertificate,
  useGenerateCertificate,
  useRegenerateCertificate,
  useRejectCertificate,
  useSaveCertificateSettings,
  useUpdateOfficeCertificateSetting,
} from './state/mutate';
import {
  useCertificateDetail,
  useCertificateList,
  useCertificateSettings,
  useMyCertificate,
  useOfficeCertificateSettingDetail,
  useOfficeCertificateSettingsList,
  usePendingCertificateApprovals,
  useVerifyCertificate,
} from './state/query';

export const useCertificate = () => {
  return {
    query: {
      verify: useVerifyCertificate,
      my: useMyCertificate,
      list: useCertificateList,
      pendingApprovals: usePendingCertificateApprovals,
      detail: useCertificateDetail,
      settings: useCertificateSettings,
      officeSettings: useOfficeCertificateSettingsList,
      officeSetting: useOfficeCertificateSettingDetail,
    },
    mutate: {
      generate: useGenerateCertificate,
      approve: useApproveCertificate,
      reject: useRejectCertificate,
      download: useDownloadCertificate,
      downloadMine: useDownloadMyCertificate,
      regenerate: useRegenerateCertificate,
      saveSettings: useSaveCertificateSettings,
      createOfficeSetting: useCreateOfficeCertificateSetting,
      updateOfficeSetting: useUpdateOfficeCertificateSetting,
    },
  };
};


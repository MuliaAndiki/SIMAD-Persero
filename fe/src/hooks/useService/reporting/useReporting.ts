import {
  useAttendanceReport,
  useCertificateReport,
  useDashboardReport,
  useInternshipReport,
} from './state/query';

export const useReporting = () => {
  return {
    query: {
      attendance: useAttendanceReport,
      internships: useInternshipReport,
      certificates: useCertificateReport,
      dashboard: useDashboardReport,
    },
  };
};

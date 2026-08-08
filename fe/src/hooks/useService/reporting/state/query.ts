import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { ReportingQuery } from '@/types/api/reporting.types';
import { useQuery } from '@tanstack/react-query';

export function useAttendanceReport(query?: ReportingQuery) {
  return useQuery({
    queryKey: queryKey.reporting.attendance(query),
    queryFn: async () => {
      const res = await Api.Reporting.Attendance(query);
      return res.data;
    },
  });
}

export function useInternshipReport() {
  return useQuery({
    queryKey: queryKey.reporting.internships(),
    queryFn: async () => {
      const res = await Api.Reporting.Internships();
      return res.data;
    },
  });
}

export function useCertificateReport() {
  return useQuery({
    queryKey: queryKey.reporting.certificates(),
    queryFn: async () => {
      const res = await Api.Reporting.Certificates();
      return res.data;
    },
  });
}

export function useDashboardReport() {
  return useQuery({
    queryKey: queryKey.reporting.dashboard(),
    queryFn: async () => {
      const res = await Api.Reporting.Dashboard();
      return res.data;
    },
  });
}

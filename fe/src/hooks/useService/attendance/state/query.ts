import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type {
  AttendanceExportQuery,
  AttendanceHistoryQuery,
  AttendanceParams,
  AttendanceQuery,
} from '@/types/api/attendance.types';
import { useQuery } from '@tanstack/react-query';

export function useAttendanceMy(query?: AttendanceQuery) {
  return useQuery({
    queryKey: queryKey.attendance.my(query),
    queryFn: async () => {
      const res = await Api.Attendance.My(query);
      return res.data;
    },
  });
}

export function useAttendanceToday() {
  return useQuery({
    queryKey: queryKey.attendance.today(),
    queryFn: async () => {
      const res = await Api.Attendance.Today();
      return res.data;
    },
  });
}

export function useAttendanceSummary(query?: AttendanceQuery) {
  return useQuery({
    queryKey: queryKey.attendance.summary(query),
    queryFn: async () => {
      const res = await Api.Attendance.Summary(query);
      return res.data;
    },
  });
}

export function useAttendanceSupervisor() {
  return useQuery({
    queryKey: queryKey.attendance.supervisor(),
    queryFn: async () => {
      const res = await Api.Attendance.Supervisor();
      return res.data;
    },
  });
}

export function useAttendanceHistory(query?: AttendanceHistoryQuery) {
  return useQuery({
    queryKey: queryKey.attendance.history(query),
    queryFn: async () => {
      const res = await Api.Attendance.History(query);
      return res.data;
    },
  });
}

export function useAttendanceExport(query?: AttendanceExportQuery) {
  return useQuery({
    queryKey: queryKey.attendance.export(query),
    queryFn: async () => {
      const res = await Api.Attendance.Export(query);
      return res.data;
    },
  });
}

export function useAttendanceDetail(
  params: Pick<AttendanceParams, 'attendanceId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.attendance.detail(params.attendanceId),
    queryFn: async () => {
      const res = await Api.Attendance.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

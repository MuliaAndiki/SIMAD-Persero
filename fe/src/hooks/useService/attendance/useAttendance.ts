import { useCheckIn, useCheckOut, useOverrideAttendance } from './state/mutate';
import {
  useAttendanceDetail,
  useAttendanceExport,
  useAttendanceHistory,
  useAttendanceMy,
  useAttendanceSummary,
  useAttendanceSupervisor,
  useAttendanceToday,
} from './state/query';

export const useAttendance = () => {
  return {
    query: {
      my: useAttendanceMy,
      today: useAttendanceToday,
      summary: useAttendanceSummary,
      supervisor: useAttendanceSupervisor,
      history: useAttendanceHistory,
      export: useAttendanceExport,
      detail: useAttendanceDetail,
    },
    mutate: {
      checkIn: useCheckIn,
      checkOut: useCheckOut,
      override: useOverrideAttendance,
    },
  };
};

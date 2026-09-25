import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import {
  type AttendanceCacheContext,
  readAttendanceSnapshot,
} from '@/utils/cache/attendance.cache';

import type {
  AttendanceParams,
  AttendanceResponse,
  CheckInBody,
  CheckOutBody,
  OverrideAttendanceBody,
  OverrideAttendanceResponse,
} from '@/types/api/attendance.types';

export function useCheckIn() {
  return useAppMutation<
    AttendanceResponse,
    Pick<CheckInBody, 'latitude' | 'longitude' | 'accuracy' | 'deviceId' | 'fakeGpsDetected'>,
    AttendanceCacheContext
  >({
    mutationFn: (body) => Api.Attendance.CheckIn(body),
    invalidateKeys: [queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readAttendanceSnapshot(ns) }),
  });
}

export function useCheckOut() {
  return useAppMutation<
    AttendanceResponse,
    Pick<CheckOutBody, 'latitude' | 'longitude' | 'accuracy'>,
    AttendanceCacheContext
  >({
    mutationFn: (body) => Api.Attendance.CheckOut(body),
    invalidateKeys: [queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readAttendanceSnapshot(ns) }),
  });
}

export function useOverrideAttendance() {
  return useAppMutation<
    OverrideAttendanceResponse,
    {
      params: Pick<AttendanceParams, 'attendanceId'>;
      body: Pick<OverrideAttendanceBody, 'type' | 'time' | 'reason'>;
    },
    AttendanceCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Attendance.Override(params, body),
    invalidateKeys: [queryKey.attendanceRoot()],
    optimistic: (ns) => ({ previousData: readAttendanceSnapshot(ns) }),
  });
}

import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type AttendanceCacheContext,
  readAttendanceSnapshot,
} from '@/utils/cache/attendance.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type {
  AttendanceParams,
  AttendanceResponse,
  CheckInBody,
  CheckOutBody,
  OverrideAttendanceBody,
  OverrideAttendanceResponse,
} from '@/types/api/attendance.types';
import { useMutation } from '@tanstack/react-query';

export function useCheckIn() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<AttendanceResponse>,
    Error,
    Pick<CheckInBody, 'latitude' | 'longitude' | 'accuracy' | 'deviceId' | 'fakeGpsDetected'>,
    AttendanceCacheContext
  >({
    mutationFn: (
      body: Pick<
        CheckInBody,
        'latitude' | 'longitude' | 'accuracy' | 'deviceId' | 'fakeGpsDetected'
      >,
    ) => Api.Attendance.CheckIn(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.attendanceRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.attendanceRoot() });
      const previousData = readAttendanceSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useCheckOut() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<AttendanceResponse>,
    Error,
    Pick<CheckOutBody, 'latitude' | 'longitude' | 'accuracy'>,
    AttendanceCacheContext
  >({
    mutationFn: (body: Pick<CheckOutBody, 'latitude' | 'longitude' | 'accuracy'>) =>
      Api.Attendance.CheckOut(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.attendanceRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.attendanceRoot() });
      const previousData = readAttendanceSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useOverrideAttendance() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<OverrideAttendanceResponse>,
    Error,
    {
      params: Pick<AttendanceParams, 'attendanceId'>;
      body: Pick<OverrideAttendanceBody, 'status' | 'reason'>;
    },
    AttendanceCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<AttendanceParams, 'attendanceId'>;
      body: Pick<OverrideAttendanceBody, 'status' | 'reason'>;
    }) => Api.Attendance.Override(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.attendanceRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.attendanceRoot() });
      const previousData = readAttendanceSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: ResponseTitles.error,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type NotificationCacheContext,
  readNotificationSnapshot,
} from '@/utils/cache/notification.cache';

import type {
  NotificationParams,
  NotificationResponse,
  ReadAllResponse,
  SendNotificationBody,
} from '@/types/api/notification.types';
import { useMutation } from '@tanstack/react-query';

export function useMarkAsRead() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<NotificationResponse>,
    Error,
    Pick<NotificationParams, 'notificationId'>,
    NotificationCacheContext
  >({
    mutationFn: (params: Pick<NotificationParams, 'notificationId'>) =>
      Api.Notification.Read(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.notificationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.notificationRoot() });
      const previousData = readNotificationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useMarkAllAsRead() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<ReadAllResponse>, Error, void, NotificationCacheContext>({
    mutationFn: () => Api.Notification.ReadAll(),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.notificationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.notificationRoot() });
      const previousData = readNotificationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useSendNotification() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<NotificationResponse>,
    Error,
    Pick<SendNotificationBody, 'typeCode' | 'title' | 'message' | 'isBroadcast' | 'userIds'>,
    NotificationCacheContext
  >({
    mutationFn: (
      body: Pick<
        SendNotificationBody,
        'typeCode' | 'title' | 'message' | 'isBroadcast' | 'userIds'
      >,
    ) => Api.Notification.Send(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.notificationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.notificationRoot() });
      const previousData = readNotificationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useDeleteNotification() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<NotificationParams, 'notificationId'>,
    NotificationCacheContext
  >({
    mutationFn: (params: Pick<NotificationParams, 'notificationId'>) =>
      Api.Notification.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.notificationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.notificationRoot() });
      const previousData = readNotificationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
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

export function useMarkAsRead() {
  return useAppMutation<
    NotificationResponse,
    Pick<NotificationParams, 'notificationId'>,
    NotificationCacheContext
  >({
    mutationFn: (params) => Api.Notification.Read(params),
    invalidateKeys: [queryKey.notificationRoot()],
    optimistic: (ns) => ({ previousData: readNotificationSnapshot(ns) }),
  });
}

export function useMarkAllAsRead() {
  return useAppMutation<ReadAllResponse, void, NotificationCacheContext>({
    mutationFn: () => Api.Notification.ReadAll(),
    invalidateKeys: [queryKey.notificationRoot()],
    optimistic: (ns) => ({ previousData: readNotificationSnapshot(ns) }),
  });
}

export function useSendNotification() {
  return useAppMutation<
    NotificationResponse,
    Pick<SendNotificationBody, 'typeCode' | 'title' | 'message' | 'isBroadcast' | 'userIds'>,
    NotificationCacheContext
  >({
    mutationFn: (body) => Api.Notification.Send(body),
    invalidateKeys: [queryKey.notificationRoot()],
    optimistic: (ns) => ({ previousData: readNotificationSnapshot(ns) }),
  });
}

export function useDeleteNotification() {
  return useAppMutation<null, Pick<NotificationParams, 'notificationId'>, NotificationCacheContext>(
    {
      mutationFn: (params) => Api.Notification.Delete(params),
      invalidateKeys: [queryKey.notificationRoot()],
      optimistic: (ns) => ({ previousData: readNotificationSnapshot(ns) }),
    },
  );
}

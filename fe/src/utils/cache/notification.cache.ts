import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { NotificationResponse } from '@/types/api/notification.types';

export type NotificationCacheContext = {
  previousData?: NotificationResponse[];
};

export function readNotificationSnapshot(ns: AppNameSpace): NotificationResponse[] | undefined {
  return ns.queryClient.getQueryData<NotificationResponse[]>(queryKey.notification.list());
}

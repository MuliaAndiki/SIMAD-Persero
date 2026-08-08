import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { NotificationParams, NotificationQuery } from '@/types/api/notification.types';
import { useQuery } from '@tanstack/react-query';

export function useNotificationList(query?: NotificationQuery) {
  return useQuery({
    queryKey: queryKey.notification.list(query),
    queryFn: async () => {
      const res = await Api.Notification.List(query);
      return res.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKey.notification.unreadCount(),
    queryFn: async () => {
      const res = await Api.Notification.UnreadCount();
      return res.data;
    },
  });
}

export function useNotificationDetail(
  params: Pick<NotificationParams, 'notificationId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.notification.detail(params.notificationId),
    queryFn: async () => {
      const res = await Api.Notification.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

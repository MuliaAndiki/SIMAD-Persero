import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useSendNotification,
} from './state/mutate';
import { useNotificationDetail, useNotificationList, useUnreadCount } from './state/query';

export const useNotification = () => {
  return {
    query: {
      list: useNotificationList,
      unreadCount: useUnreadCount,
      detail: useNotificationDetail,
    },
    mutate: {
      markAsRead: useMarkAsRead,
      markAllAsRead: useMarkAllAsRead,
      send: useSendNotification,
      delete: useDeleteNotification,
    },
  };
};

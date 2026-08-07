// Types for the Notification module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §18, docs/04-business-rules.md §24
import type { INotification, INotificationRead, INotificationType, IUser } from './models.types';

/** GET /notifications query */
export type NotificationQuery = Partial<{
  page: number;
  limit: number;
}>;

/** POST /notifications/send body */
export type SendNotificationBody = {
  typeCode?: INotificationType['code'];
  title: string;
  message: string;
  isBroadcast?: boolean;
  userIds?: IUser['id'][];
};

/** Serialized notification returned to clients. */
export type NotificationResponse = {
  id: INotification['id'];
  typeId: INotification['typeId'];
  typeCode: INotificationType['code'] | null;
  typeName: INotificationType['name'];
  title: INotification['title'];
  message: INotification['message'];
  isBroadcast: INotification['isBroadcast'];
  senderId: INotification['senderId'];
  senderName: IUser['fullName'] | null;
  createdAt: INotification['createdAt'];
  readAt: INotificationRead['readAt'];
  isRead: boolean;
};

import { useAuditLogDetail, useAuditLogList, useUserActivity } from './state/query';

export const useAuditLog = () => {
  return {
    query: {
      list: useAuditLogList,
      userActivity: useUserActivity,
      detail: useAuditLogDetail,
    },
  };
};

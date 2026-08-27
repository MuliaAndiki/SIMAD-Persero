import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { AuditLogParams, AuditLogQuery, AuditLogUserParams } from '@/types/api/auditLog.types';
import { useQuery } from '@tanstack/react-query';

export function useAuditLogList(query?: AuditLogQuery) {
  return useQuery({
    queryKey: queryKey.auditLog.list(query),
    queryFn: async () => {
      const res = await Api.AuditLog.List(query);
      return res.data;
    },
  });
}

export function useUserActivity(
  params: Pick<AuditLogUserParams, 'userId'>,
  query?: AuditLogQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.auditLog.userActivity(params.userId, query),
    queryFn: async () => {
      const res = await Api.AuditLog.UserActivity(params, query);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useAuditLogDetail(
  params: Pick<AuditLogParams, 'auditId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.auditLog.detail(params.auditId),
    queryFn: async () => {
      const res = await Api.AuditLog.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

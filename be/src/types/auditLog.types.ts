// Types for the Audit Log module.
// Diturunkan dari base model (models.types.ts) memakai Utility Types.
// Source: docs/07-api-specification.md §27, docs/04-business-rules.md §26
import type { IAuditLog, IUser } from './models.types';

/** GET /audit-logs query (BR-AUDIT-003). */
export type AuditLogQuery = Partial<{
  page: number;
  limit: number;
  module: IAuditLog['module'];
  action: IAuditLog['action'];
  userId: IUser['id'];
  startDate: string;
  endDate: string;
}>;

/** User ringkas pada audit log. */
export type AuditLogUser = Pick<IUser, 'id' | 'fullName' | 'email'>;

/** Representasi audit log (BR-AUDIT-003). */
export type AuditLogResponse = {
  id: IAuditLog['id'];
  user: AuditLogUser | null;
  module: IAuditLog['module'];
  action: IAuditLog['action'];
  tableName: IAuditLog['tableName'];
  recordId: IAuditLog['recordId'];
  oldData: NonNullable<IAuditLog['oldData']> | null;
  newData: NonNullable<IAuditLog['newData']> | null;
  ipAddress: IAuditLog['ipAddress'];
  userAgent: IAuditLog['userAgent'];
  createdAt: IAuditLog['createdAt'];
};

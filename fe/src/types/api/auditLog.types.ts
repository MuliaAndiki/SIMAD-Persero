/**
 * Tipe payload & respons modul Audit Log.
 *
 * Nama field query disamakan dengan DTO backend (be/src/dtos/auditLog.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/AuditLogController.ts).
 */

import type { IAuditLog } from './model.type';

// ---------- Payload (query / path params) ----------

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogParams {
  auditId: string;
}

export interface AuditLogUserParams {
  userId: string;
}

// ---------- Response (data dari backend) ----------

/** User ringkas pada audit log. */
export interface AuditLogUser {
  id: string;
  fullName: string;
  email: string;
}

/** Data satu audit log (GET /audit-logs, GET /audit-logs/:auditId). */
export interface AuditLogResponse
  extends Omit<
    IAuditLog,
    'userId' | 'module' | 'action' | 'tableName' | 'recordId' | 'oldData' | 'newData' | 'createdAt'
  > {
  user: AuditLogUser | null;
  module: string;
  action: string;
  tableName: string;
  recordId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
}

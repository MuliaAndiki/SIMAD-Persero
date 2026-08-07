import type { Prisma } from '@prisma/client';

/**
 * Helper reusable untuk mencatat Audit Log (BR-AUDIT-001/003).
 *
 * Dipakai di dalam blok `$transaction` agar pencatatan audit atomik dengan
 * perubahan data. Contoh:
 *
 *   await prisma.$transaction(async (tx) => {
 *     const result = await tx.department.update(...);
 *     await createAuditLog(tx, {
 *       userId,
 *       module: 'DEPARTMENT',
 *       action: 'UPDATE',
 *       tableName: 'departments',
 *       recordId: result.id,
 *       oldData: { name: oldName },
 *       newData: { name: result.name },
 *     });
 *   });
 */
export type AuditLogInput = {
  userId?: string | null;
  module: string;
  action: string;
  tableName?: string | null;
  recordId?: string | null;
  oldData?: Prisma.InputJsonValue | null;
  newData?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(tx: Prisma.TransactionClient, input: AuditLogInput) {
  return tx.auditLog.create({
    data: {
      userId: input.userId ?? null,
      module: input.module,
      action: input.action,
      tableName: input.tableName ?? null,
      recordId: input.recordId ?? null,
      oldData: input.oldData ?? undefined,
      newData: input.newData ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

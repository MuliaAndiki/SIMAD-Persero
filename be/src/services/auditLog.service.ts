import { AppError } from '@/http/error';
import type { AuditLogQuery, AuditLogResponse } from '@/types/auditLog.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Audit Log.
 * Audit log bersifat immutable (BR-AUDIT-001/002) — modul ini hanya menyediakan
 * operasi baca untuk Administrator (BR-AUDIT-005).
 * Sumber aturan: docs/07-api-specification.md §27, docs/04-business-rules.md §26.
 */
class AuditLogService {
  private readonly userSelect = {
    id: true,
    fullName: true,
    email: true,
  } as const;

  private serialize(log: any): AuditLogResponse {
    return {
      id: log.id,
      user: log.user ?? null,
      module: log.module,
      action: log.action,
      tableName: log.tableName,
      recordId: log.recordId,
      oldData: log.oldData ?? null,
      newData: log.newData ?? null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    };
  }

  private resolvePagination(query: AuditLogQuery): {
    page: number;
    limit: number;
  } {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    return { page, limit };
  }

  private buildWhere(query: AuditLogQuery): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.module) {
      where.module = query.module;
    }
    if (query.action) {
      where.action = query.action;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.startDate || query.endDate) {
      const createdAtFilter: { gte?: Date; lte?: Date } = {};
      if (query.startDate) {
        createdAtFilter.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        createdAtFilter.lte = new Date(query.endDate);
      }
      where.createdAt = createdAtFilter;
    }

    return where;
  }

  // ── 27.1 Get Audit Logs ─────────────────────────────────────────────

  public async list(query: AuditLogQuery) {
    const { page, limit } = this.resolvePagination(query);
    const where = this.buildWhere(query);

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { user: { select: this.userSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: logs.map((log: (typeof logs)[number]) => this.serialize(log)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── 27.2 Audit Detail ───────────────────────────────────────────────

  public async getById(auditId: string) {
    const log = await prisma.auditLog.findUnique({
      where: { id: auditId },
      include: { user: { select: this.userSelect } },
    });

    if (!log) {
      throw new AppError(404, 'Audit log tidak ditemukan.');
    }

    return this.serialize(log);
  }

  // ── 27.3 User Activity ──────────────────────────────────────────────

  public async getUserActivity(userId: string, query: AuditLogQuery) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User tidak ditemukan.');
    }

    const { page, limit } = this.resolvePagination(query);

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where: { userId } }),
      prisma.auditLog.findMany({
        where: { userId },
        include: { user: { select: this.userSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: logs.map((log: (typeof logs)[number]) => this.serialize(log)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new AuditLogService();

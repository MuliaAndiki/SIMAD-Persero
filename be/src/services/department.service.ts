import { AppError } from '@/http/error';
import type {
  CreateDepartmentBody,
  DepartmentQuery,
  UpdateDepartmentBody,
} from '@/types/department.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Department.
 * Seluruh logika bisnis (validasi, query DB) berada di sini.
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Sumber aturan: docs/07-api-specification.md §22.
 */
class DepartmentService {
  // GET /departments
  public async list(query: DepartmentQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.keyword) {
      where.OR = [
        { code: { contains: query.keyword, mode: 'insensitive' } },
        { name: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.isActive = query.status === 'ACTIVE';
    }

    const [data, total] = await prisma.$transaction([
      prisma.department.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.department.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET /departments/:departmentId
  public async getById(id: string) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new AppError(404, 'Department not found');
    }
    return department;
  }

  // POST /departments
  public async create(input: CreateDepartmentBody) {
    const code = input.code?.trim();
    if (!code) {
      throw new AppError(400, 'Department code is required');
    }

    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      throw new AppError(409, 'Department code already exists');
    }

    return prisma.department.create({
      data: {
        code,
        name: input.name?.trim() || null,
        description: input.description?.trim() || null,
        isActive: true,
      },
    });
  }

  // PATCH /departments/:departmentId
  public async update(id: string, input: UpdateDepartmentBody) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new AppError(404, 'Department not found');
    }

    const data: Record<string, unknown> = {};

    if (input.code !== undefined) {
      const code = input.code.trim();
      if (!code) {
        throw new AppError(400, 'Department code is required');
      }
      const existing = await prisma.department.findUnique({ where: { code } });
      if (existing && existing.id !== id) {
        throw new AppError(409, 'Department code already exists');
      }
      data.code = code;
    }

    if (input.name !== undefined) {
      data.name = input.name.trim() || null;
    }

    if (input.description !== undefined) {
      data.description = input.description.trim() || null;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    return prisma.department.update({ where: { id }, data });
  }

  // DELETE /departments/:departmentId — soft delete via isActive = false
  public async remove(id: string) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new AppError(404, 'Department not found');
    }
    if (!department.isActive) {
      throw new AppError(409, 'Department is already inactive');
    }

    return prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new DepartmentService();

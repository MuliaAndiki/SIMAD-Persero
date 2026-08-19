import { AppError } from '@/http/error';
import type { CreateOfficeBody, OfficeQuery, UpdateOfficeBody } from '@/types/office.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Office (Office Location).
 * Seluruh logika bisnis (validasi, query DB) berada di sini.
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Sumber aturan: docs/07-api-specification.md §23.
 */
class OfficeService {
  // Proyeksi departemen yang dikembalikan bersama kantor (m2m).
  private readonly departmentSelect = {
    select: { id: true, name: true },
  } as const;

  // Konversi Decimal Prisma ke Number agar respons JSON ringkas (koordinat).
  private serialize(office: {
    latitude: unknown;
    longitude: unknown;
    [key: string]: unknown;
  }) {
    return {
      ...office,
      latitude: office.latitude != null ? Number(office.latitude) : null,
      longitude: office.longitude != null ? Number(office.longitude) : null,
    };
  }

  // GET /offices
  public async list(query: OfficeQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { address: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    // Filter m2m: kantor yang terhubung dengan departemen tertentu.
    if (query.departmentId) {
      where.departments = { some: { id: query.departmentId } };
    }

    const [items, total] = await prisma.$transaction([
      prisma.officeLocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { departments: this.departmentSelect },
      }),
      prisma.officeLocation.count({ where }),
    ]);

    return {
      data: items.map((office) => this.serialize(office)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET /offices/:officeId
  public async getById(id: string) {
    const office = await prisma.officeLocation.findUnique({
      where: { id },
      include: { departments: this.departmentSelect },
    });
    if (!office) {
      throw new AppError(404, 'Office location not found');
    }
    return this.serialize(office);
  }

  // POST /offices
  public async create(input: CreateOfficeBody) {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError(400, 'Office name is required');
    }

    const departmentIds = input.departmentIds ?? [];
    for (const departmentId of departmentIds) {
      await this.ensureDepartmentExists(departmentId);
    }

    const office = await prisma.officeLocation.create({
      data: {
        name,
        address: input.address?.trim() || null,
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMeter: input.radiusMeter,
        departments: {
          connect: departmentIds.map((id) => ({ id })),
        },
      },
      include: { departments: this.departmentSelect },
    });

    return this.serialize(office);
  }

  // PATCH /offices/:officeId
  public async update(id: string, input: UpdateOfficeBody) {
    const office = await prisma.officeLocation.findUnique({ where: { id } });
    if (!office) {
      throw new AppError(404, 'Office location not found');
    }

    const departmentIds = input.departmentIds;
    if (departmentIds !== undefined) {
      for (const departmentId of departmentIds) {
        await this.ensureDepartmentExists(departmentId);
      }
    }

    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new AppError(400, 'Office name is required');
      }
      data.name = name;
    }
    if (departmentIds !== undefined) {
      data.departments = { set: departmentIds.map((id) => ({ id })) };
    }
    if (input.address !== undefined) data.address = input.address.trim() || null;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.radiusMeter !== undefined) data.radiusMeter = input.radiusMeter;

    const updated = await prisma.officeLocation.update({
      where: { id },
      data,
      include: { departments: this.departmentSelect },
    });
    return this.serialize(updated);
  }

  // DELETE /offices/:officeId
  public async remove(id: string) {
    const office = await prisma.officeLocation.findUnique({ where: { id } });
    if (!office) {
      throw new AppError(404, 'Office location not found');
    }

    try {
      await prisma.officeLocation.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new AppError(
          409,
          'Tidak dapat menghapus kantor karena masih digunakan oleh data Absensi atau Penempatan Magang',
        );
      }
      throw error;
    }
  }

  private async ensureDepartmentExists(departmentId: string) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new AppError(404, 'Department not found');
    }
    if (!department.isActive) {
      throw new AppError(409, 'Department is inactive');
    }
  }
}

export default new OfficeService();

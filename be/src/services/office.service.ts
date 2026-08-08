import { AppError } from "@/http/error";
import type {
  CreateOfficeBody,
  OfficeQuery,
  UpdateOfficeBody,
} from "@/types/office.types";
import prisma from "../../prisma/client";

/**
 * Service layer modul Office (Office Location).
 * Seluruh logika bisnis (validasi, query DB) berada di sini.
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Sumber aturan: docs/07-api-specification.md §23.
 */
class OfficeService {
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
        { name: { contains: query.keyword, mode: "insensitive" } },
        { address: { contains: query.keyword, mode: "insensitive" } },
      ];
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    const [items, total] = await prisma.$transaction([
      prisma.officeLocation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
    const office = await prisma.officeLocation.findUnique({ where: { id } });
    if (!office) {
      throw new AppError(404, "Office location not found");
    }
    return this.serialize(office);
  }

  // POST /offices
  public async create(input: CreateOfficeBody) {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError(400, "Office name is required");
    }

    if (input.departmentId) {
      await this.ensureDepartmentExists(input.departmentId);
    }

    const office = await prisma.officeLocation.create({
      data: {
        departmentId: input.departmentId || null,
        name,
        address: input.address?.trim() || null,
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMeter: input.radiusMeter,
      },
    });

    return this.serialize(office);
  }

  // PATCH /offices/:officeId
  public async update(id: string, input: UpdateOfficeBody) {
    const office = await prisma.officeLocation.findUnique({ where: { id } });
    if (!office) {
      throw new AppError(404, "Office location not found");
    }

    if (input.departmentId !== undefined) {
      await this.ensureDepartmentExists(input.departmentId);
    }

    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new AppError(400, "Office name is required");
      }
      data.name = name;
    }
    if (input.departmentId !== undefined)
      data.departmentId = input.departmentId || null;
    if (input.address !== undefined)
      data.address = input.address.trim() || null;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.radiusMeter !== undefined) data.radiusMeter = input.radiusMeter;

    const updated = await prisma.officeLocation.update({ where: { id }, data });
    return this.serialize(updated);
  }

  // DELETE /offices/:officeId
  public async remove(id: string) {
    const office = await prisma.officeLocation.findUnique({ where: { id } });
    if (!office) {
      throw new AppError(404, "Office location not found");
    }

    await prisma.officeLocation.delete({ where: { id } });
  }

  private async ensureDepartmentExists(departmentId: string) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new AppError(404, "Department not found");
    }
    if (!department.isActive) {
      throw new AppError(409, "Department is inactive");
    }
  }
}

export default new OfficeService();

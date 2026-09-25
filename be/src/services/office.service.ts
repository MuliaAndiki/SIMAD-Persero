import { AppError } from '@/http/error';
import type { CreateOfficeBody, OfficeQuery, UpdateOfficeBody } from '@/types/office.types';
import prisma from '../../prisma/client';

function parseTimeString(timeStr?: string | null): Date | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = String(parseInt(parts[0], 10)).padStart(2, '0');
  const m = String(parseInt(parts[1], 10)).padStart(2, '0');
  const s = parts[2] ? String(parseInt(parts[2], 10)).padStart(2, '0') : '00';
  return new Date(`1970-01-01T${h}:${m}:${s}.000Z`);
}

function formatTimeString(date?: Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Service layer modul Office (Office Location).
 * Seluruh logika bisnis (validasi, query DB) berada di sini.
 */
class OfficeService {
  // Proyeksi departemen yang dikembalikan bersama kantor (m2m).
  private readonly departmentSelect = {
    select: { id: true, name: true, code: true },
  } as const;

  // Konversi Decimal Prisma ke Number & AttendanceSetting format string
  private serialize(office: any) {
    const rawSetting = office.attendanceSettings?.[0] || office.attendanceSetting || null;
    return {
      ...office,
      latitude: office.latitude != null ? Number(office.latitude) : null,
      longitude: office.longitude != null ? Number(office.longitude) : null,
      attendanceSetting: rawSetting
        ? {
            id: rawSetting.id,
            officeLocationId: rawSetting.officeLocationId,
            checkInStart: formatTimeString(rawSetting.checkInStart),
            checkInEnd: formatTimeString(rawSetting.checkInEnd),
            checkOutStart: formatTimeString(rawSetting.checkOutStart),
            checkOutEnd: formatTimeString(rawSetting.checkOutEnd),
            lateAfter: formatTimeString(rawSetting.lateAfter),
            allowWeekend: Boolean(rawSetting.allowWeekend),
          }
        : null,
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
        include: {
          departments: this.departmentSelect,
          attendanceSettings: true,
          internshipQuotas: {
            include: {
              departmentAllocations: {
                include: { department: { select: { id: true, name: true, code: true } } },
              },
            },
          },
        },
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
      include: {
        departments: this.departmentSelect,
        attendanceSettings: true,
        internshipQuotas: {
          include: {
            departmentAllocations: {
              include: { department: { select: { id: true, name: true, code: true } } },
            },
          },
        },
      },
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
        attendanceSettings: {
          create: {
            checkInStart: parseTimeString(input.attendanceSetting?.checkInStart ?? '06:00'),
            checkInEnd: parseTimeString(input.attendanceSetting?.checkInEnd ?? '10:00'),
            checkOutStart: parseTimeString(input.attendanceSetting?.checkOutStart ?? '16:00'),
            checkOutEnd: parseTimeString(input.attendanceSetting?.checkOutEnd ?? '20:00'),
            lateAfter: parseTimeString(input.attendanceSetting?.lateAfter ?? '08:00'),
            allowWeekend: Boolean(input.attendanceSetting?.allowWeekend),
          },
        },
      },
      include: {
        departments: this.departmentSelect,
        attendanceSettings: true,
      },
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
      data.departments = { set: departmentIds.map((deptId) => ({ id: deptId })) };
    }
    if (input.address !== undefined) data.address = input.address.trim() || null;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.radiusMeter !== undefined) data.radiusMeter = input.radiusMeter;

    // Handle attendance setting update / upsert
    if (input.attendanceSetting !== undefined) {
      const existingSetting = await prisma.attendanceSetting.findFirst({
        where: { officeLocationId: id },
      });

      const settingData: any = {};
      if (input.attendanceSetting.checkInStart !== undefined) {
        settingData.checkInStart = parseTimeString(input.attendanceSetting.checkInStart);
      }
      if (input.attendanceSetting.checkInEnd !== undefined) {
        settingData.checkInEnd = parseTimeString(input.attendanceSetting.checkInEnd);
      }
      if (input.attendanceSetting.checkOutStart !== undefined) {
        settingData.checkOutStart = parseTimeString(input.attendanceSetting.checkOutStart);
      }
      if (input.attendanceSetting.checkOutEnd !== undefined) {
        settingData.checkOutEnd = parseTimeString(input.attendanceSetting.checkOutEnd);
      }
      if (input.attendanceSetting.lateAfter !== undefined) {
        settingData.lateAfter = parseTimeString(input.attendanceSetting.lateAfter);
      }
      if (input.attendanceSetting.allowWeekend !== undefined) {
        settingData.allowWeekend = Boolean(input.attendanceSetting.allowWeekend);
      }

      if (existingSetting) {
        await prisma.attendanceSetting.update({
          where: { id: existingSetting.id },
          data: settingData,
        });
      } else {
        await prisma.attendanceSetting.create({
          data: {
            officeLocationId: id,
            checkInStart: parseTimeString(input.attendanceSetting.checkInStart ?? '06:00'),
            checkInEnd: parseTimeString(input.attendanceSetting.checkInEnd ?? '10:00'),
            checkOutStart: parseTimeString(input.attendanceSetting.checkOutStart ?? '16:00'),
            checkOutEnd: parseTimeString(input.attendanceSetting.checkOutEnd ?? '20:00'),
            lateAfter: parseTimeString(input.attendanceSetting.lateAfter ?? '08:00'),
            allowWeekend: Boolean(input.attendanceSetting.allowWeekend),
          },
        });
      }
    }

    const updated = await prisma.officeLocation.update({
      where: { id },
      data,
      include: {
        departments: this.departmentSelect,
        attendanceSettings: true,
      },
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
      // Hapus attendanceSetting terlebih dahulu jika ada
      await prisma.attendanceSetting.deleteMany({ where: { officeLocationId: id } });
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

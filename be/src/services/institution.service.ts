import { AppError } from '@/http/error';
import type { InstitutionQuery } from '@/types/institution.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Institution.
 * Seluruh logika bisnis (validasi, query DB) berada di sini.
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 */
class InstitutionService {
  // GET /institutions
  public async list(query: InstitutionQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { shortName: { contains: query.keyword, mode: 'insensitive' } },
        { province: { contains: query.keyword, mode: 'insensitive' } },
        { city: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.educationLevelId) {
      where.educationLevelId = query.educationLevelId;
    }

    const [data, total] = await prisma.$transaction([
      prisma.institution.findMany({
        where,
        include: {
          educationLevel: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.institution.count({ where }),
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

  // GET /education-levels
  public async getEducationLevels() {
    return prisma.educationLevel.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // GET /institutions/:institutionId
  public async getById(id: string) {
    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        educationLevel: {
          select: { id: true, code: true, name: true },
        },
      },
    });
    if (!institution) {
      throw new AppError(404, 'Institution not found');
    }
    return institution;
  }

  // POST /institutions
  public async create(data: {
    name: string;
    shortName?: string;
    educationLevelId?: string;
    province?: string;
    city?: string;
    logo?: string;
  }) {
    return prisma.institution.create({
      data: {
        name: data.name,
        shortName: data.shortName || null,
        educationLevelId: data.educationLevelId || null,
        province: data.province || null,
        city: data.city || null,
        logo: data.logo || null,
      },
      include: {
        educationLevel: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  // PUT /institutions/:institutionId
  public async update(
    id: string,
    data: {
      name?: string;
      shortName?: string;
      educationLevelId?: string;
      province?: string;
      city?: string;
      logo?: string;
    },
  ) {
    await this.getById(id);
    return prisma.institution.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.shortName !== undefined && { shortName: data.shortName || null }),
        ...(data.educationLevelId !== undefined && {
          educationLevelId: data.educationLevelId || null,
        }),
        ...(data.province !== undefined && { province: data.province || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.logo !== undefined && { logo: data.logo || null }),
      },
      include: {
        educationLevel: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  // DELETE /institutions/:institutionId
  public async delete(id: string) {
    await this.getById(id);
    return prisma.institution.delete({
      where: { id },
    });
  }
}

export default new InstitutionService();

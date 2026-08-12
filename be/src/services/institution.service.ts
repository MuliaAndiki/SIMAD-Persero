import { AppError } from "@/http/error";
import type { InstitutionQuery } from "@/types/institution.types";
import prisma from "../../prisma/client";

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
        { name: { contains: query.keyword, mode: "insensitive" } },
        { shortName: { contains: query.keyword, mode: "insensitive" } },
        { province: { contains: query.keyword, mode: "insensitive" } },
        { city: { contains: query.keyword, mode: "insensitive" } },
      ];
    }

    const [data, total] = await prisma.$transaction([
      prisma.institution.findMany({
        where,
        orderBy: { name: "asc" },
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

  // GET /institutions/:institutionId
  public async getById(id: string) {
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution) {
      throw new AppError(404, "Institution not found");
    }
    return institution;
  }
}

export default new InstitutionService();

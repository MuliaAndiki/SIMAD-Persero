import prisma from '../../prisma/client';
import { BadRequestError, NotFoundError } from '@/http/error';
import type {
  CreateQuotaBody,
  DepartmentAvailabilityInfo,
  QuotaAvailabilityQuery,
  QuotaAvailabilityResult,
  QuotaQuery,
  UpdateQuotaBody,
} from '@/types/quota.types';

class QuotaService {
  /**
   * Menambahkan kuota magang baru untuk Kantor dengan alokasi terbagi ke Departemen.
   */
  public async create(userId: string | undefined, payload: CreateQuotaBody) {
    const { officeLocationId, totalCapacity, notes, isActive, allocations = [] } = payload;

    const totalCap = Number(totalCapacity);
    if (totalCap <= 0) {
      throw new BadRequestError('Total kapasitas kuota kantor harus lebih dari 0');
    }

    // Validasi keberadaan kantor
    const office = await prisma.officeLocation.findUnique({
      where: { id: officeLocationId },
    });
    if (!office) {
      throw new NotFoundError('Lokasi kantor tidak ditemukan');
    }

    // Validasi kuota kantor belum ada
    const existing = await prisma.internshipQuota.findUnique({
      where: { officeLocationId },
    });
    if (existing) {
      throw new BadRequestError('Kuota untuk lokasi kantor ini sudah terdaftar. Silakan lakukan perubahan (edit).');
    }

    // Validasi alokasi departemen jika ada
    let totalAllocated = 0;
    const seenDeptIds = new Set<string>();

    for (const alloc of allocations) {
      if (seenDeptIds.has(alloc.departmentId)) {
        throw new BadRequestError('Terdapat departemen ganda dalam daftar alokasi kuota');
      }
      seenDeptIds.add(alloc.departmentId);

      const allocCap = Number(alloc.capacity);
      if (allocCap < 0) {
        throw new BadRequestError('Kapasitas alokasi departemen tidak boleh negatif');
      }
      totalAllocated += allocCap;
    }

    if (totalAllocated > totalCap) {
      throw new BadRequestError(
        `Total alokasi kuota departemen (${totalAllocated}) melebihi total kapasitas kuota kantor (${totalCap})`,
      );
    }

    // Validasi ID departemen ada di database
    if (allocations.length > 0) {
      const deptCount = await prisma.department.count({
        where: { id: { in: Array.from(seenDeptIds) } },
      });
      if (deptCount !== seenDeptIds.size) {
        throw new BadRequestError('Satu atau lebih departemen tidak ditemukan dalam sistem');
      }
    }

    const quota = await prisma.internshipQuota.create({
      data: {
        officeLocationId,
        totalCapacity: totalCap,
        notes: notes ?? null,
        isActive: isActive ?? true,
        createdBy: userId ?? null,
        departmentAllocations: {
          create: allocations.map((a) => ({
            departmentId: a.departmentId,
            capacity: Number(a.capacity),
            notes: a.notes ?? null,
          })),
        },
      },
      include: {
        officeLocation: { select: { id: true, name: true } },
        departmentAllocations: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return quota;
  }

  /**
   * Mengambil daftar alokasi kuota kantor dengan pagination, filter, dan data alokasi departemen.
   */
  public async list(query: QuotaQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.officeLocationId) {
      where.officeLocationId = query.officeLocationId;
    }

    if (query.departmentId) {
      where.departmentAllocations = {
        some: { departmentId: query.departmentId },
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = String(query.isActive) === 'true';
    }

    const [total, items] = await Promise.all([
      prisma.internshipQuota.count({ where }),
      prisma.internshipQuota.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          officeLocation: { select: { id: true, name: true, address: true } },
          departmentAllocations: {
            include: {
              department: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil detail alokasi kuota berdasarkan ID.
   */
  public async getById(id: string) {
    const quota = await prisma.internshipQuota.findUnique({
      where: { id },
      include: {
        officeLocation: { select: { id: true, name: true, address: true } },
        departmentAllocations: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!quota) {
      throw new NotFoundError('Data kuota magang tidak ditemukan');
    }

    return quota;
  }

  /**
   * Memperbarui data kuota kantor dan alokasi departemen di dalamnya.
   */
  public async update(id: string, payload: UpdateQuotaBody) {
    const existing = await this.getById(id);

    const updateData: any = {};
    const newTotalCap =
      payload.totalCapacity !== undefined ? Number(payload.totalCapacity) : existing.totalCapacity;

    if (newTotalCap <= 0) {
      throw new BadRequestError('Total kapasitas kuota kantor harus lebih dari 0');
    }
    updateData.totalCapacity = newTotalCap;

    if (payload.notes !== undefined) {
      updateData.notes = payload.notes;
    }

    if (payload.isActive !== undefined) {
      updateData.isActive = Boolean(payload.isActive);
    }

    // Jika ada pembaruan alokasi departemen
    if (payload.allocations !== undefined) {
      let totalAllocated = 0;
      const seenDeptIds = new Set<string>();

      for (const alloc of payload.allocations) {
        if (seenDeptIds.has(alloc.departmentId)) {
          throw new BadRequestError('Terdapat departemen ganda dalam daftar alokasi kuota');
        }
        seenDeptIds.add(alloc.departmentId);
        const allocCap = Number(alloc.capacity);
        if (allocCap < 0) {
          throw new BadRequestError('Kapasitas alokasi departemen tidak boleh negatif');
        }
        totalAllocated += allocCap;
      }

      if (totalAllocated > newTotalCap) {
        throw new BadRequestError(
          `Total alokasi kuota departemen (${totalAllocated}) melebihi total kapasitas kuota kantor (${newTotalCap})`,
        );
      }

      // Hapus alokasi lama dan buat alokasi baru dalam transaksi
      await prisma.$transaction([
        prisma.quotaDepartmentAllocation.deleteMany({ where: { quotaId: id } }),
        prisma.quotaDepartmentAllocation.createMany({
          data: payload.allocations.map((a) => ({
            quotaId: id,
            departmentId: a.departmentId,
            capacity: Number(a.capacity),
            notes: a.notes ?? null,
          })),
        }),
      ]);
    }

    const updated = await prisma.internshipQuota.update({
      where: { id },
      data: updateData,
      include: {
        officeLocation: { select: { id: true, name: true, address: true } },
        departmentAllocations: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Menghapus kuota kantor.
   */
  public async remove(id: string) {
    await this.getById(id);

    const count = await prisma.internship.count({
      where: { quotaId: id },
    });

    if (count > 0) {
      return prisma.internshipQuota.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.internshipQuota.delete({
      where: { id },
    });
  }

  /**
   * Memeriksa ketersediaan slot magang kantor dan alokasi departemen.
   * Mendukung pengecekan untuk satu kantor spesifik atau seluruh kantor se-PLN.
   * Slot dihitung secara dinamis dari kapasitas tetap dikurangi peserta magang yang sedang aktif / masuk.
   */
  public async checkAvailability(params: QuotaAvailabilityQuery): Promise<QuotaAvailabilityResult> {
    const { officeLocationId, departmentId, startDate, endDate } = params;

    let reqStart: Date | undefined;
    let reqEnd: Date | undefined;

    if (startDate && endDate) {
      reqStart = new Date(startDate);
      reqEnd = new Date(endDate);
      if (reqStart >= reqEnd) {
        throw new BadRequestError('Tanggal mulai magang harus sebelum tanggal selesai');
      }
    }

    // Kasus 1: Pengecekan seluruh kantor jika officeLocationId tidak dispesifikasikan
    if (!officeLocationId || officeLocationId === 'ALL') {
      const activeQuotas = await prisma.internshipQuota.findMany({
        where: { isActive: true },
        include: {
          officeLocation: { select: { id: true, name: true } },
          departmentAllocations: {
            include: {
              department: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });

      let globalCapacity = 0;
      let globalOccupied = 0;
      let globalAvailable = 0;

      const officeResults = await Promise.all(
        activeQuotas.map(async (quota) => {
          const internshipWhere: any = {
            officeLocationId: quota.officeLocationId,
            status: { in: ['PENDING', 'ACTIVE'] },
          };
          if (reqStart && reqEnd) {
            internshipWhere.actualStartDate = { lte: reqEnd };
            internshipWhere.actualEndDate = { gte: reqStart };
          }

          const officeOccupied = await prisma.internship.count({
            where: internshipWhere,
          });

          const officeAvailable = Math.max(0, quota.totalCapacity - officeOccupied);

          globalCapacity += quota.totalCapacity;
          globalOccupied += officeOccupied;
          globalAvailable += officeAvailable;

          const departmentBreakdown: DepartmentAvailabilityInfo[] = await Promise.all(
            quota.departmentAllocations.map(async (alloc) => {
              const deptOccupied = await prisma.internship.count({
                where: {
                  ...internshipWhere,
                  departmentId: alloc.departmentId,
                },
              });

              const deptAvailable = Math.max(0, alloc.capacity - deptOccupied);

              return {
                departmentId: alloc.departmentId,
                departmentName: alloc.department.name ?? 'Departemen',
                departmentCode: alloc.department.code,
                allocatedCapacity: alloc.capacity,
                occupied: deptOccupied,
                available: Math.min(deptAvailable, officeAvailable),
              };
            }),
          );

          return {
            officeLocationId: quota.officeLocationId,
            officeName: quota.officeLocation?.name ?? 'Kantor PLN',
            totalCapacity: quota.totalCapacity,
            totalOccupied: officeOccupied,
            totalAvailable: officeAvailable,
            isAvailable: officeAvailable > 0,
            departments: departmentBreakdown,
          };
        }),
      );

      return {
        totalCapacity: globalCapacity,
        totalOccupied: globalOccupied,
        totalAvailable: globalAvailable,
        isAvailable: globalAvailable > 0,
        offices: officeResults,
      };
    }

    // Kasus 2: Pengecekan kantor spesifik
    const internshipWhere: any = {
      officeLocationId,
      status: { in: ['PENDING', 'ACTIVE'] },
    };

    if (reqStart && reqEnd) {
      internshipWhere.actualStartDate = { lte: reqEnd };
      internshipWhere.actualEndDate = { gte: reqStart };
    }

    // Cari konfigurasi kuota kantor
    const quota = await prisma.internshipQuota.findUnique({
      where: {
        officeLocationId,
      },
      include: {
        officeLocation: { select: { id: true, name: true } },
        departmentAllocations: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!quota || !quota.isActive) {
      return {
        officeLocationId,
        totalCapacity: 0,
        totalOccupied: 0,
        totalAvailable: 0,
        isAvailable: false,
        departments: [],
      };
    }

    // 1. Hitung total okupansi seluruh kantor
    const totalOfficeOccupied = await prisma.internship.count({
      where: internshipWhere,
    });

    const totalAvailable = Math.max(0, quota.totalCapacity - totalOfficeOccupied);

    // 2. Hitung okupansi & ketersediaan per departemen yang dialokasikan
    const departmentBreakdown: DepartmentAvailabilityInfo[] = await Promise.all(
      quota.departmentAllocations.map(async (alloc) => {
        const deptOccupied = await prisma.internship.count({
          where: {
            ...internshipWhere,
            departmentId: alloc.departmentId,
          },
        });

        const deptAvailable = Math.max(0, alloc.capacity - deptOccupied);

        return {
          departmentId: alloc.departmentId,
          departmentName: alloc.department.name ?? 'Departemen',
          departmentCode: alloc.department.code,
          allocatedCapacity: alloc.capacity,
          occupied: deptOccupied,
          available: Math.min(deptAvailable, totalAvailable),
        };
      }),
    );

    // 3. Jika meminta department spesifik
    let specificDeptCap: number | undefined;
    let specificDeptOcc: number | undefined;
    let specificDeptAvail: number | undefined;

    if (departmentId) {
      const match = departmentBreakdown.find((d) => d.departmentId === departmentId);
      if (match) {
        specificDeptCap = match.allocatedCapacity;
        specificDeptOcc = match.occupied;
        specificDeptAvail = match.available;
      } else {
        specificDeptCap = 0;
        specificDeptOcc = 0;
        specificDeptAvail = 0;
      }
    }

    const isAvailable = departmentId
      ? (specificDeptAvail ?? 0) > 0
      : totalAvailable > 0;

    return {
      officeLocationId,
      officeName: quota.officeLocation?.name ?? undefined,
      totalCapacity: quota.totalCapacity,
      totalOccupied: totalOfficeOccupied,
      totalAvailable,
      isAvailable,
      quotaId: quota.id,
      departmentId,
      departmentCapacity: specificDeptCap,
      departmentOccupied: specificDeptOcc,
      departmentAvailable: specificDeptAvail,
      departments: departmentBreakdown,
    };
  }
}

export default new QuotaService();

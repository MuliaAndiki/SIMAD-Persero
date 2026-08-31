import { AppError } from '@/http/error';
import type {
  CreateReceptionistBody,
  ReceptionistQuery,
  ReceptionistResponse,
  UpdateReceptionistBody,
} from '@/types/receptionist.types';
import { createAuditLog } from '@/utils/audit.util';
import * as bcryptjs from 'bcryptjs';
import prisma from '../../prisma/client';

/**
 * Service layer modul Receptionist.
 */
class ReceptionistService {
  private readonly receptionistUserWhere = {
    userRoles: { some: { role: { code: 'receptionist' } } },
  } as const;

  private serializeReceptionist(user: any): ReceptionistResponse {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      avatarFileId: user.avatarFileId ?? null,
      createdAt: user.createdAt ?? null,
      officeId: user.officeId ?? null,
      departmentId: user.departmentId ?? null,
    };
  }

  private async findReceptionistUser(receptionistId: string) {
    const user = await prisma.user.findUnique({
      where: { id: receptionistId },
      include: {
        userRoles: { include: { role: { select: { code: true } } } },
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError(404, 'Receptionist not found');
    }

    const isReceptionist = user.userRoles.some((ur) => ur.role?.code === 'receptionist');
    if (!isReceptionist) {
      throw new AppError(400, 'User does not have the RECEPTIONIST role');
    }

    return user;
  }

  public async list(query: ReceptionistQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const keyword = query.keyword;

    const where: any = {
      ...this.receptionistUserWhere,
      deletedAt: null,
    };

    if (query.officeId) {
      where.officeId = query.officeId;
    }

    if (keyword) {
      where.OR = [
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data = users.map((u) => this.serializeReceptionist(u));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public async getById(receptionistId: string) {
    const user = await this.findReceptionistUser(receptionistId);
    return this.serializeReceptionist(user);
  }

  public async createAccount(actionUserId: string, input: CreateReceptionistBody) {
    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new AppError(400, 'Email sudah terdaftar');
      }

      const hashedPassword = await bcryptjs.hash(input.password || '123456', 10);

      const role = await tx.role.findFirst({ where: { code: 'receptionist' } });
      if (!role) {
        throw new AppError(500, 'Role RECEPTIONIST tidak ditemukan di sistem');
      }

      const user = await tx.user.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          password: hashedPassword,
          isActive: true,
          departmentId: input.departmentId,
          officeId: input.officeId,
          userRoles: {
            create: { roleId: role.id, assignedById: actionUserId },
          },
        },
      });

      await createAuditLog(tx, {
        userId: actionUserId,
        module: 'RECEPTIONIST',
        action: 'CREATE',
        tableName: 'users',
        recordId: user.id,
        newData: {
          email: user.email,
          fullName: user.fullName,
          officeId: user.officeId,
        },
      });

      return this.serializeReceptionist(user);
    });
  }

  public async updateAccount(
    actionUserId: string,
    receptionistId: string,
    input: UpdateReceptionistBody,
  ) {
    const user = await this.findReceptionistUser(receptionistId);
    return prisma.$transaction(async (tx) => {
      if (input.email && input.email !== user.email) {
        const existingUser = await tx.user.findFirst({
          where: { email: input.email },
        });
        if (existingUser) {
          throw new AppError(400, 'Email sudah terdaftar');
        }
      }

      const updateData: any = {};
      if (input.fullName !== undefined) updateData.fullName = input.fullName;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;
      if (input.officeId !== undefined) updateData.officeId = input.officeId;
      if (input.password) {
        updateData.password = await bcryptjs.hash(input.password, 10);
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await createAuditLog(tx, {
        userId: actionUserId,
        module: 'RECEPTIONIST',
        action: 'UPDATE',
        tableName: 'users',
        recordId: updatedUser.id,
        newData: updateData,
        oldData: {
          email: user.email,
          fullName: user.fullName,
          officeId: user.officeId,
        },
      });

      return this.serializeReceptionist(updatedUser);
    });
  }

  public async deleteAccount(actionUserId: string, receptionistId: string) {
    const user = await this.findReceptionistUser(receptionistId);
    return prisma.$transaction(async (tx) => {
      const deletedUser = await tx.user.update({
        where: { id: user.id },
        data: { deletedAt: new Date(), isActive: false },
      });

      await createAuditLog(tx, {
        userId: actionUserId,
        module: 'RECEPTIONIST',
        action: 'DELETE',
        tableName: 'users',
        recordId: deletedUser.id,
      });
      return true;
    });
  }
}

export default new ReceptionistService();

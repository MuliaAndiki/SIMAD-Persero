import { AppError } from '@/http/error';
import { InternshipStatus } from '@/types/internship.types';
import type {
  AssignInternBody,
  SupervisorAssignmentResponse,
  SupervisorDashboardResponse,
  SupervisorQuery,
  SupervisorResponse,
} from '@/types/supervisor.types';
import { createAuditLog } from '@/utils/audit.util';
import prisma from '../../prisma/client';

/**
 * Service layer modul Supervisor.
 * - Supervisor diidentifikasi via user dengan role code `SUPERVISOR`.
 * - Assign/remove assignment menonaktifkan assignment aktif sebelumnya
 *   (pola sama dengan InternshipService.assignSupervisor).
 * Sumber aturan: docs/07-api-specification.md §24.
 */
class SupervisorService {
  private readonly supervisorUserWhere = {
    userRoles: { some: { role: { code: 'SUPERVISOR' } } },
  } as const;

  private readonly assignmentInclude = {
    internship: {
      include: {
        internProfile: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        department: { select: { id: true, name: true } },
      },
    },
  } as const;

  private serializeAssignment(assignment: any): SupervisorAssignmentResponse {
    const internProfile = assignment.internship?.internProfile;
    return {
      id: assignment.id,
      internshipId: assignment.internshipId,
      supervisorId: assignment.supervisorId,
      assignedById: assignment.assignedById,
      assignedAt: assignment.assignedAt,
      endedAt: assignment.endedAt,
      isActive: assignment.isActive,
      internship: assignment.internship
        ? {
            id: assignment.internship.id,
            status: assignment.internship.status,
            actualStartDate: assignment.internship.actualStartDate,
            actualEndDate: assignment.internship.actualEndDate,
            intern: internProfile?.user
              ? {
                  id: internProfile.user.id,
                  fullName: internProfile.user.fullName,
                  email: internProfile.user.email,
                  studentNumber: internProfile.studentNumber,
                }
              : null,
            department: assignment.internship.department ?? null,
          }
        : null,
    };
  }

  private serializeSupervisor(user: any, activeAssignmentsCount = 0): SupervisorResponse {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      avatarFileId: user.avatarFileId ?? null,
      createdAt: user.createdAt ?? null,
      activeAssignmentsCount,
    };
  }

  private async findSupervisorUser(supervisorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: supervisorId },
      include: {
        userRoles: { include: { role: { select: { code: true } } } },
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError(404, 'Supervisor not found');
    }

    const isSupervisor = user.userRoles.some((ur) => ur.role?.code === 'SUPERVISOR');
    if (!isSupervisor) {
      throw new AppError(400, 'User does not have the SUPERVISOR role');
    }

    return user;
  }

  // ─── 24.1 Get Supervisors (HR_ADMIN) ────────────────────────────

  public async list(query: SupervisorQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where: this.supervisorUserWhere }),
      prisma.user.findMany({
        where: this.supervisorUserWhere,
        orderBy: { fullName: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          avatarFileId: true,
          createdAt: true,
          _count: {
            select: {
              assignedSupervisors: { where: { isActive: true } },
            },
          },
        },
      }),
    ]);

    const data = users.map((u: (typeof users)[number]) =>
      this.serializeSupervisor(u, u._count.assignedSupervisors),
    );

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── 24.2 Supervisor Detail (HR_ADMIN) ──────────────────────────

  public async getById(supervisorId: string) {
    const user = await this.findSupervisorUser(supervisorId);

    const [activeCount, assignments] = await prisma.$transaction([
      prisma.supervisorAssignment.count({
        where: { supervisorId, isActive: true },
      }),
      prisma.supervisorAssignment.findMany({
        where: { supervisorId, isActive: true },
        orderBy: { assignedAt: 'desc' },
        include: this.assignmentInclude,
      }),
    ]);

    return {
      ...this.serializeSupervisor(user, activeCount),
      assignments: assignments.map((a: (typeof assignments)[number]) =>
        this.serializeAssignment(a),
      ),
    };
  }

  // ─── 24.3 Assign Intern (HR_ADMIN) ──────────────────────────────

  public async assignIntern(supervisorId: string, userId: string, input: AssignInternBody) {
    const supervisor = await this.findSupervisorUser(supervisorId);

    const internship = await prisma.internship.findUnique({
      where: { id: input.internshipId },
      select: {
        id: true,
        status: true,
        internProfile: { select: { id: true } },
      },
    });
    if (!internship) {
      throw new AppError(404, 'Internship not found');
    }

    return prisma.$transaction(async (tx) => {
      // Nonaktifkan assignment aktif sebelumnya untuk internship yang sama.
      await tx.supervisorAssignment.updateMany({
        where: { internshipId: internship.id, isActive: true },
        data: { isActive: false, endedAt: new Date() },
      });

      const assignment = await tx.supervisorAssignment.create({
        data: {
          internshipId: internship.id,
          supervisorId: supervisor.id,
          assignedById: userId,
          assignedAt: new Date(),
          isActive: true,
        },
      });

      // BR-AUDIT-001: perubahan data wajib masuk audit log.
      await createAuditLog(tx, {
        userId,
        module: 'SUPERVISOR',
        action: 'ASSIGN',
        tableName: 'supervisor_assignments',
        recordId: assignment.id,
        newData: {
          internshipId: internship.id,
          supervisorId: supervisor.id,
        },
      });

      return assignment;
    });
  }

  // ─── 24.4 Remove Assignment (HR_ADMIN) ──────────────────────────

  public async removeAssignment(supervisorId: string, assignmentId: string, userId: string) {
    await this.findSupervisorUser(supervisorId);

    const assignment = await prisma.supervisorAssignment.findFirst({
      where: { id: assignmentId, supervisorId },
    });
    if (!assignment) {
      throw new AppError(404, 'Supervisor assignment not found');
    }
    if (!assignment.isActive) {
      throw new AppError(400, 'Assignment is already inactive');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.supervisorAssignment.update({
        where: { id: assignment.id },
        data: { isActive: false, endedAt: new Date() },
      });

      await createAuditLog(tx, {
        userId,
        module: 'SUPERVISOR',
        action: 'REMOVE_ASSIGNMENT',
        tableName: 'supervisor_assignments',
        recordId: assignment.id,
        newData: { isActive: false, endedAt: new Date() },
      });

      return result;
    });

    return { id: updated.id };
  }

  // ─── 24.5 Supervisor Dashboard Summary (SUPERVISOR) ─────────────

  public async getDashboard(userId: string): Promise<SupervisorDashboardResponse> {
    const assignments = await prisma.supervisorAssignment.findMany({
      where: { supervisorId: userId, isActive: true },
      orderBy: { assignedAt: 'desc' },
      include: this.assignmentInclude,
    });

    const activeInternships = assignments.filter(
      (a) => a.internship?.status === InternshipStatus.ACTIVE,
    ).length;

    const internshipIds = assignments
      .map((a) => a.internship?.id)
      .filter((id): id is string => Boolean(id));

    // Rentang hari ini (UTC+7), sama seperti AttendanceService.getTodayRange.
    const now = new Date();
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dateStr = utc7.toISOString().slice(0, 10);
    const todayDate = new Date(`${dateStr}T00:00:00.000Z`);

    const todayAttendance =
      internshipIds.length > 0
        ? await prisma.attendance.count({
            where: {
              internshipId: { in: internshipIds },
              attendanceDate: todayDate,
            },
          })
        : 0;

    const totalAssignments = await prisma.supervisorAssignment.count({
      where: { supervisorId: userId },
    });

    return {
      totalAssignments,
      activeAssignments: assignments.length,
      activeInternships,
      todayAttendance,
      totalInterns: internshipIds.length,
      recentAssignments: assignments
        .slice(0, 10)
        .map((a: (typeof assignments)[number]) => this.serializeAssignment(a)),
    };
  }
}

export default new SupervisorService();

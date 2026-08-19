import { AppError } from '@/http/error';
import {
  type AddSkillsBody,
  type AssignSupervisorBody,
  type ChangeDepartmentBody,
  type ExtendInternshipBody,
  InternshipStatus,
  type PickMergeInternship,
} from '@/types/internship.types';
import { createAuditLog } from '@/utils/audit.util';
import prisma from '../../prisma/client';
import { getLogger } from '../telemetry/otel.config';

/**
 * Service layer for the Internship module.
 * Source: docs/07-api-specification.md §15, docs/05-state-machine.md §9,
 *         docs/04-business-rules.md §11.
 */
class InternshipService {
  // ─── Helpers ─────────────────────────────────────────────────

  /** Record a status transition in internship_status_histories. */
  private async recordStatusHistory(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    internshipId: string,
    oldStatus: string | null,
    newStatus: string,
    changedById: string | null,
    notes?: string,
  ) {
    await tx.internshipStatusHistory.create({
      data: {
        internshipId,
        oldStatus,
        newStatus,
        changedById,
        notes: notes || null,
      },
    });
  }

  /** Get an internship by id with common includes, or throw 404. */
  private async findById(id: string) {
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true, address: true } },
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            user: { select: { id: true, fullName: true, email: true } },
            institution: { select: { id: true, name: true } },
            major: { select: { id: true, name: true } },
          },
        },
        application: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
            requestedStartDate: true,
            requestedEndDate: true,
          },
        },
        supervisorAssignments: {
          where: { isActive: true },
          select: {
            id: true,
            supervisor: { select: { id: true, fullName: true, email: true } },
            assignedAt: true,
          },
        },
      },
    });

    if (!internship) {
      throw new AppError(404, 'Internship not found');
    }

    return internship;
  }

  // ─── 15.1 Get My Internship ─────────────────────────────────

  public async list() {
    return prisma.internship.findMany({
      include: {
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true, address: true } },
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            user: { select: { id: true, fullName: true, email: true } },
            institution: { select: { id: true, name: true } },
            major: { select: { id: true, name: true } },
          },
        },
        application: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
            requestedStartDate: true,
            requestedEndDate: true,
          },
        },
        supervisorAssignments: {
          where: { isActive: true },
          select: {
            id: true,
            supervisor: { select: { id: true, fullName: true, email: true } },
            assignedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getMyInternship(userId: string) {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new AppError(422, 'Intern profile not found');
    }

    const internships = await prisma.internship.findMany({
      where: { internProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true } },
        application: {
          select: { id: true, applicationNumber: true, status: true },
        },
        supervisorAssignments: {
          where: { isActive: true },
          select: {
            id: true,
            supervisor: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    return internships;
  }

  // ─── 15.2 Get Internship Detail ─────────────────────────────

  public async getById(id: string) {
    return this.findById(id);
  }

  // ─── Complete Onboarding (INTERN) ───────────────────────────
  //
  // Menyelesaikan onboarding digital: menandai onboardingHistory sebagai
  // diterima (accepted = true) dan memindahkan status internship dari
  // ONBOARDING_PENDING ke ONBOARDING_COMPLETED (docs/05-state-machine.md §9).
  // Side effects: waktu persetujuan, IP Address, user agent, audit log.

  public async completeOnboarding(
    id: string,
    userId: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const internship = await this.findById(id);

    // Ownership — hanya pemilik internship yang boleh menyelesaikan onboarding.
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new AppError(422, 'Intern profile not found');
    }

    if (internship.internProfileId !== profile.id) {
      throw new AppError(403, 'You can only complete onboarding for your own internship');
    }

    // State machine — hanya boleh dari ONBOARDING_PENDING.
    if (internship.status !== InternshipStatus.ONBOARDING_PENDING) {
      throw new AppError(400, 'Onboarding can only be completed from ONBOARDING_PENDING status');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Tandai onboarding history sebagai diterima.
      const onboarding = await tx.onboardingHistory.findFirst({
        where: { internshipId: id },
      });

      if (onboarding) {
        await tx.onboardingHistory.update({
          where: { id: onboarding.id },
          data: {
            accepted: true,
            acceptedAt: new Date(),
            ipAddress: meta.ipAddress ?? null,
            userAgent: meta.userAgent ?? null,
          },
        });
      }

      // 2. Pindahkan status internship ke ONBOARDING_COMPLETED.
      const updated = await tx.internship.update({
        where: { id },
        data: {
          status: InternshipStatus.ONBOARDING_COMPLETED,
          onboardingCompleted: true,
        },
      });

      // 3. Catat histori status.
      await this.recordStatusHistory(
        tx,
        id,
        internship.status,
        InternshipStatus.ONBOARDING_COMPLETED,
        userId,
        'Onboarding completed by intern',
      );

      // 4. Audit log (BR-AUDIT-001/003).
      await createAuditLog(tx, {
        userId,
        module: 'INTERNSHIP',
        action: 'COMPLETE_ONBOARDING',
        tableName: 'internships',
        recordId: id,
        oldData: {
          status: internship.status,
          onboardingCompleted: internship.onboardingCompleted,
        },
        newData: {
          status: InternshipStatus.ONBOARDING_COMPLETED,
          onboardingCompleted: true,
        },
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
      });

      return updated;
    });
  }

  // ─── 15.3 Start Internship (HR_ADMIN) ───────────────────────

  public async start(id: string, userId: string) {
    const internship = await this.findById(id);

    if (
      internship.status !== InternshipStatus.ONBOARDING_PENDING &&
      internship.status !== InternshipStatus.ONBOARDING_COMPLETED
    ) {
      throw new AppError(
        400,
        'Internship can only be started from ONBOARDING_PENDING or ONBOARDING_COMPLETED status',
      );
    }

    // If onboarding is pending, check that it has been accepted
    if (internship.status === InternshipStatus.ONBOARDING_PENDING) {
      const onboarding = await prisma.onboardingHistory.findFirst({
        where: { internshipId: id, accepted: true },
      });
      if (!onboarding) {
        throw new AppError(400, 'Onboarding must be completed before starting the internship');
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id },
        data: {
          status: InternshipStatus.ACTIVE,
          onboardingCompleted: true,
          actualStartDate: internship.actualStartDate ?? new Date(),
        },
      });

      await this.recordStatusHistory(
        tx,
        id,
        internship.status,
        InternshipStatus.ACTIVE,
        userId,
        'Internship started',
      );

      return updated;
    });
  }

  // ─── 15.3b Auto-Start Due Internships (Scheduled Job) ───────

  /**
   * Automatically start internships whose determined start date
   * (actualStartDate) has arrived.
   *
   * Only ONBOARDING_COMPLETED internships are considered — the onboarding
   * flow must be finished before an internship may become ACTIVE
   * (docs/05-state-machine.md §9). Called by the daily cron job
   * (src/cron/internship.cron.ts); transitions are recorded with
   * changedById = null (system-triggered).
   */
  public async autoStartDueInternships() {
    const now = new Date();

    const dueInternships = await prisma.internship.findMany({
      where: {
        status: InternshipStatus.ONBOARDING_COMPLETED,
        actualStartDate: { lte: now },
      },
      select: { id: true, status: true, actualStartDate: true },
    });

    let started = 0;
    for (const internship of dueInternships) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.internship.update({
            where: { id: internship.id },
            data: {
              status: InternshipStatus.ACTIVE,
              onboardingCompleted: true,
              actualStartDate: internship.actualStartDate ?? now,
            },
          });

          await this.recordStatusHistory(
            tx,
            internship.id,
            internship.status,
            InternshipStatus.ACTIVE,
            null,
            'Auto-started by scheduled job (start date reached)',
          );
        });
        started += 1;
      } catch (error) {
        getLogger().error(
          { err: error, internshipId: internship.id },
          '[internship-cron] Failed to auto-start internship',
        );
      }
    }

    return { processed: dueInternships.length, started };
  }

  // ─── 15.4 Finish Internship (HR_ADMIN) ──────────────────────

  public async finish(id: string, userId: string) {
    const internship = await this.findById(id);

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new AppError(400, 'Only ACTIVE internships can be finished');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id },
        data: {
          status: InternshipStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await this.recordStatusHistory(
        tx,
        id,
        InternshipStatus.ACTIVE,
        InternshipStatus.COMPLETED,
        userId,
        'Internship completed',
      );

      return updated;
    });
  }

  // ─── 15.5 Extend Internship (HR_ADMIN) ──────────────────────

  public async extend(id: string, userId: string, input: ExtendInternshipBody) {
    const internship = await this.findById(id);

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new AppError(400, 'Only ACTIVE internships can be extended');
    }

    const newEndDate = new Date(input.newEndDate);
    if (Number.isNaN(newEndDate.getTime())) {
      throw new AppError(400, 'Invalid date format for newEndDate');
    }

    if (internship.actualEndDate && newEndDate <= internship.actualEndDate) {
      throw new AppError(400, 'New end date must be after the current end date');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id },
        data: { actualEndDate: newEndDate },
      });

      await this.recordStatusHistory(
        tx,
        id,
        InternshipStatus.ACTIVE,
        InternshipStatus.ACTIVE,
        userId,
        `Internship extended to ${input.newEndDate}. ${input.reason || ''}`.trim(),
      );

      return updated;
    });
  }

  // ─── 15.6 Assign Supervisor (HR_ADMIN) ──────────────────────

  public async assignSupervisor(id: string, userId: string, input: AssignSupervisorBody) {
    const internship = await this.findById(id);

    if (
      internship.status === InternshipStatus.COMPLETED ||
      internship.status === InternshipStatus.ARCHIVED ||
      internship.status === InternshipStatus.CERTIFICATE_GENERATED
    ) {
      throw new AppError(400, 'Cannot assign supervisor to a finalized internship');
    }

    // Validate supervisor user
    const supervisorUser = await prisma.user.findUnique({
      where: { id: input.supervisorId },
      include: {
        userRoles: { include: { role: { select: { code: true } } } },
      },
    });

    if (!supervisorUser || !supervisorUser.isActive) {
      throw new AppError(404, 'Supervisor user not found or inactive');
    }

    const isSupervisor = supervisorUser.userRoles.some((ur) => ur.role?.code === 'SUPERVISOR');
    if (!isSupervisor) {
      throw new AppError(400, 'Selected user does not have the SUPERVISOR role');
    }

    return prisma.$transaction(async (tx) => {
      // Deactivate previous active assignments
      await tx.supervisorAssignment.updateMany({
        where: { internshipId: id, isActive: true },
        data: { isActive: false, endedAt: new Date() },
      });

      // Create new assignment
      const assignment = await tx.supervisorAssignment.create({
        data: {
          internshipId: id,
          supervisorId: input.supervisorId,
          assignedById: userId,
          assignedAt: new Date(),
          isActive: true,
        },
      });

      await this.recordStatusHistory(
        tx,
        id,
        internship.status,
        internship.status!,
        userId,
        `Supervisor changed to ${supervisorUser.fullName}`,
      );

      return assignment;
    });
  }

  // ─── 15.7 Change Department (HR_ADMIN) ──────────────────────

  public async changeDepartment(id: string, userId: string, input: ChangeDepartmentBody) {
    const internship = await this.findById(id);

    if (
      internship.status === InternshipStatus.COMPLETED ||
      internship.status === InternshipStatus.ARCHIVED ||
      internship.status === InternshipStatus.CERTIFICATE_GENERATED
    ) {
      throw new AppError(400, 'Cannot change department for a finalized internship');
    }

    // Validate department
    const department = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });
    if (!department || !department.isActive) {
      throw new AppError(404, 'Department not found or inactive');
    }

    // Validate office location (optional)
    let officeLocationId: string | null = internship.officeLocationId;
    if (input.officeLocationId) {
      const office = await prisma.officeLocation.findUnique({
        where: { id: input.officeLocationId },
      });
      if (!office) {
        throw new AppError(404, 'Office location not found');
      }
      officeLocationId = office.id;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id },
        data: {
          departmentId: input.departmentId,
          officeLocationId,
        },
      });

      await this.recordStatusHistory(
        tx,
        id,
        internship.status,
        internship.status!,
        userId,
        `Department changed to ${department.name} (${department.code})`,
      );

      return updated;
    });
  }

  // ─── 15.8 Archive Internship (HR_ADMIN) ─────────────────────

  public async archive(id: string, userId: string) {
    const internship = await this.findById(id);

    if (
      internship.status !== InternshipStatus.COMPLETED &&
      internship.status !== InternshipStatus.CERTIFICATE_GENERATED
    ) {
      throw new AppError(
        400,
        'Only COMPLETED or CERTIFICATE_GENERATED internships can be archived',
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id },
        data: { status: InternshipStatus.ARCHIVED },
      });

      await this.recordStatusHistory(
        tx,
        id,
        internship.status,
        InternshipStatus.ARCHIVED,
        userId,
        'Internship archived',
      );

      return updated;
    });
  }

  // ----- 15.9  Update InternProfile --------
  public async internProfile(userId: string, payload: PickMergeInternship) {
    const [queryInstitutionMajor, queryInternProfile] = await prisma.$transaction(async (tx) => {
      const newMayor = await tx.institutionMajor.create({
        data: {
          name: payload.name,
          institutionId: payload.institutionId,
        },
        select: {
          id: true,
        },
      });
      const newProfile = await tx.internProfile.create({
        data: {
          phone: payload.phone,
          studentNumber: payload.studentNumber,
          address: payload.address,
          bio: payload.bio,
          birthDate: payload.birthDate,
          birthPlace: payload.birthPlace,
          emergencyContact: payload.emergencyContact,
          gender: payload.gender,
          userId: userId,
          institutionId: payload.institutionId,
          majorId: newMayor.id,
        },
      });
      return [newMayor, newProfile];
    });
    return [queryInstitutionMajor, queryInternProfile];
  }
  //
  public async getMyProfileIntern(userId: string) {
    const queryService = await prisma.internProfile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        major: true,
        institution: true,
        internships: true,
        profileSkills: {
          include: {
            skill: true,
          },
        },
      },
    });
    return queryService;
  }

  // get All Skill
  public async getSkillAll(
    query: {
      search?: string;
      folderId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate)
        (where.createdAt as Record<string, unknown>).gte = new Date(query.startDate);
      if (query.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(query.endDate);
    }

    const orderBy: Record<string, unknown>[] = [];
    if (query.sortBy) {
      orderBy.push({ [query.sortBy]: query.sortOrder ?? 'asc' });
    } else {
      orderBy.push({ createdAt: 'asc' });
    }

    const [totalData, data] = await prisma.$transaction([
      prisma.skill.count({ where }),
      prisma.skill.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);
    const totalPage = Math.ceil(totalData / limit);

    return {
      data,
      meta: {
        currentPage: page,
        limit: limit,
        totalData: totalData,
        totalPage: totalPage,
      },
    };
  }

  public async createSkill(data: { name: string; category: string }) {
    const existing = await prisma.skill.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });
    if (existing) {
      throw new AppError(400, 'Skill dengan nama tersebut sudah ada');
    }
    return await prisma.skill.create({ data });
  }

  public async updateSkill(id: string, data: { name?: string; category?: string }) {
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Skill tidak ditemukan');
    }
    if (data.name && existing.name && data.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.skill.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } },
      });
      if (duplicate) {
        throw new AppError(400, 'Skill dengan nama tersebut sudah ada');
      }
    }
    return await prisma.skill.update({
      where: { id },
      data,
    });
  }

  public async deleteSkill(id: string) {
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Skill tidak ditemukan');
    }
    await prisma.internProfileSkill.deleteMany({ where: { skillId: id } });
    return await prisma.skill.delete({ where: { id } });
  }

  public async AddSkillInternShip(input: AddSkillsBody) {
    const query = await prisma.internProfileSkill.createMany({
      data: input.skills.map((skill) => ({
        skillId: skill.skillId,
        internProfileId: input.internProfileId,
        proficiency: skill.proficiency,
      })),
      skipDuplicates: true,
    });

    if (!query) {
      throw new AppError(400, 'Service Crashes');
    }
    return query;
  }

  // DELETE /internships/remove-skill/:skillId
  public async removeSkillInternShip(userId: string, skillId: string) {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError(404, 'Intern profile not found');
    }

    const query = await prisma.internProfileSkill.deleteMany({
      where: {
        internProfileId: profile.id,
        skillId,
      },
    });

    if (query.count === 0) {
      throw new AppError(404, 'Skill tidak ditemukan di profil magang');
    }

    return query;
  }
}

export default new InternshipService();

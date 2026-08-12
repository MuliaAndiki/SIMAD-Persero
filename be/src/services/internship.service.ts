import { AppError } from "@/http/error";
import {
  type AssignSupervisorBody,
  type ChangeDepartmentBody,
  type ExtendInternshipBody,
  InternshipStatus,
  type PickMergeInternship,
} from "@/types/internship.types";
import prisma from "../../prisma/client";

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
    changedById: string,
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
      throw new AppError(404, "Internship not found");
    }

    return internship;
  }

  // ─── 15.1 Get My Internship ─────────────────────────────────

  public async getMyInternship(userId: string) {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new AppError(422, "Intern profile not found");
    }

    const internships = await prisma.internship.findMany({
      where: { internProfileId: profile.id },
      orderBy: { createdAt: "desc" },
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

  // ─── 15.3 Start Internship (HR_ADMIN) ───────────────────────

  public async start(id: string, userId: string) {
    const internship = await this.findById(id);

    if (
      internship.status !== InternshipStatus.ONBOARDING_PENDING &&
      internship.status !== InternshipStatus.ONBOARDING_COMPLETED
    ) {
      throw new AppError(
        400,
        "Internship can only be started from ONBOARDING_PENDING or ONBOARDING_COMPLETED status",
      );
    }

    // If onboarding is pending, check that it has been accepted
    if (internship.status === InternshipStatus.ONBOARDING_PENDING) {
      const onboarding = await prisma.onboardingHistory.findFirst({
        where: { internshipId: id, accepted: true },
      });
      if (!onboarding) {
        throw new AppError(
          400,
          "Onboarding must be completed before starting the internship",
        );
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
        "Internship started",
      );

      return updated;
    });
  }

  // ─── 15.4 Finish Internship (HR_ADMIN) ──────────────────────

  public async finish(id: string, userId: string) {
    const internship = await this.findById(id);

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new AppError(400, "Only ACTIVE internships can be finished");
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
        "Internship completed",
      );

      return updated;
    });
  }

  // ─── 15.5 Extend Internship (HR_ADMIN) ──────────────────────

  public async extend(id: string, userId: string, input: ExtendInternshipBody) {
    const internship = await this.findById(id);

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new AppError(400, "Only ACTIVE internships can be extended");
    }

    const newEndDate = new Date(input.newEndDate);
    if (Number.isNaN(newEndDate.getTime())) {
      throw new AppError(400, "Invalid date format for newEndDate");
    }

    if (internship.actualEndDate && newEndDate <= internship.actualEndDate) {
      throw new AppError(
        400,
        "New end date must be after the current end date",
      );
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
        `Internship extended to ${input.newEndDate}. ${input.reason || ""}`.trim(),
      );

      return updated;
    });
  }

  // ─── 15.6 Assign Supervisor (HR_ADMIN) ──────────────────────

  public async assignSupervisor(
    id: string,
    userId: string,
    input: AssignSupervisorBody,
  ) {
    const internship = await this.findById(id);

    if (
      internship.status === InternshipStatus.COMPLETED ||
      internship.status === InternshipStatus.ARCHIVED ||
      internship.status === InternshipStatus.CERTIFICATE_GENERATED
    ) {
      throw new AppError(
        400,
        "Cannot assign supervisor to a finalized internship",
      );
    }

    // Validate supervisor user
    const supervisorUser = await prisma.user.findUnique({
      where: { id: input.supervisorId },
      include: {
        userRoles: { include: { role: { select: { code: true } } } },
      },
    });

    if (!supervisorUser || !supervisorUser.isActive) {
      throw new AppError(404, "Supervisor user not found or inactive");
    }

    const isSupervisor = supervisorUser.userRoles.some(
      (ur) => ur.role?.code === "SUPERVISOR",
    );
    if (!isSupervisor) {
      throw new AppError(
        400,
        "Selected user does not have the SUPERVISOR role",
      );
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

  public async changeDepartment(
    id: string,
    userId: string,
    input: ChangeDepartmentBody,
  ) {
    const internship = await this.findById(id);

    if (
      internship.status === InternshipStatus.COMPLETED ||
      internship.status === InternshipStatus.ARCHIVED ||
      internship.status === InternshipStatus.CERTIFICATE_GENERATED
    ) {
      throw new AppError(
        400,
        "Cannot change department for a finalized internship",
      );
    }

    // Validate department
    const department = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });
    if (!department || !department.isActive) {
      throw new AppError(404, "Department not found or inactive");
    }

    // Validate office location (optional)
    let officeLocationId: string | null = internship.officeLocationId;
    if (input.officeLocationId) {
      const office = await prisma.officeLocation.findUnique({
        where: { id: input.officeLocationId },
      });
      if (!office) {
        throw new AppError(404, "Office location not found");
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
        "Only COMPLETED or CERTIFICATE_GENERATED internships can be archived",
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
        "Internship archived",
      );

      return updated;
    });
  }

  // ----- 15.9  Update InternProfile --------
  public async internProfile(userId: string, payload: PickMergeInternship) {
    const [queryInstitutionMajor, queryInternProfile] =
      await prisma.$transaction(async (tx) => {
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
}

export default new InternshipService();

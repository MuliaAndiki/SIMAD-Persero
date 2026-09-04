import { AppError } from "@/http/error";
import {
  ACTIVE_APPLICATION_STATUSES,
  type ApplicationQuery,
  ApplicationStatus,
  type ApproveApplicationBody,
  type CreateApplicationBody,
  type RejectApplicationBody,
  type UpdateApplicationBody,
} from "@/types/application.types";
import type { AuthUser } from "@/types/auth.types";
import { InternshipStatus } from "@/types/internship.types";
import prisma from "../../prisma/client";

/**
 * Service layer for the Internship Application module.
 * Source: docs/07-api-specification.md §14, docs/05-state-machine.md §8,
 *         docs/04-business-rules.md §10-11 (BR-APP-013..018).
 */
class ApplicationService {
  // ─── Helpers ─────────────────────────────────────────────────

  /** Generate a unique application number: APP-YYYYMMDD-XXXX */
  private generateApplicationNumber(): string {
    const now = new Date();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `APP-${datePart}-${random}`;
  }

  /** Resolve the current user's intern profile id, or throw. */
  private async getInternProfileId(userId: string): Promise<string> {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true, deletedAt: true },
    });
    if (!profile || profile.deletedAt) {
      throw new AppError(
        422,
        "Intern profile not found. Please complete your profile first.",
      );
    }
    return profile.id;
  }

  /** Ensure no other active application exists for this intern profile. */
  private async assertNoActiveApplication(
    internProfileId: string,
    excludeId?: string,
  ) {
    const where: Record<string, unknown> = {
      internProfileId,
      status: { in: ACTIVE_APPLICATION_STATUSES },
    };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const existing = await prisma.internshipApplication.findFirst({ where });
    if (existing) {
      throw new AppError(
        409,
        "You already have an active application. Please wait until it is resolved.",
      );
    }
  }

  /** Validate date range. */
  private validateDates(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new AppError(400, "Invalid date format");
    }
    if (start >= end) {
      throw new AppError(400, "Start date must be before end date");
    }
    if (start < new Date()) {
      throw new AppError(400, "Start date must be in the future");
    }
  }

  /** Validate that the cover letter file exists and is not deleted. */
  private async assertFileExists(fileId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, deletedAt: true },
    });
    if (!file || file.deletedAt) {
      throw new AppError(404, "Cover letter file not found");
    }
  }

  // ─── 14.1 Create Application ────────────────────────────────

  public async create(userId: string, input: CreateApplicationBody) {
    const internProfileId = await this.getInternProfileId(userId);
    await this.assertNoActiveApplication(internProfileId);
    this.validateDates(input.requestedStartDate, input.requestedEndDate);
    await this.assertFileExists(input.coverLetterFileId);

    return prisma.internshipApplication.create({
      data: {
        internProfileId,
        applicationNumber: this.generateApplicationNumber(),
        introductionLetterFileId: input.coverLetterFileId,
        requestedStartDate: new Date(input.requestedStartDate),
        requestedEndDate: new Date(input.requestedEndDate),
        motivation: input.motivation?.trim() || null,
        status: ApplicationStatus.DRAFT,
      },
    });
  }

  // ─── 14.2 Get My Applications ───────────────────────────────

  public async getMyApplications(userId: string) {
    const internProfileId = await this.getInternProfileId(userId);

    return prisma.internshipApplication.findMany({
      where: { internProfileId },
      orderBy: { createdAt: "desc" },
      include: {
        introductionLetterFile: {
          select: { id: true, originalName: true, mimeType: true, url: true },
        },
      },
    });
  }

  // ─── 14.3 Update Draft Application ──────────────────────────

  public async updateDraft(
    id: string,
    userId: string,
    input: UpdateApplicationBody,
  ) {
    const app = await this.findOwnedApplication(id, userId);

    if (app.status !== ApplicationStatus.DRAFT) {
      throw new AppError(400, "Only DRAFT applications can be edited");
    }

    const data: Record<string, unknown> = {};

    if (
      input.requestedStartDate !== undefined ||
      input.requestedEndDate !== undefined
    ) {
      const startDate =
        input.requestedStartDate ?? app.requestedStartDate?.toISOString();
      const endDate =
        input.requestedEndDate ?? app.requestedEndDate?.toISOString();
      if (startDate && endDate) {
        this.validateDates(startDate, endDate);
      }
      if (input.requestedStartDate) {
        data.requestedStartDate = new Date(input.requestedStartDate);
      }
      if (input.requestedEndDate) {
        data.requestedEndDate = new Date(input.requestedEndDate);
      }
    }

    if (input.motivation !== undefined) {
      data.motivation = input.motivation.trim() || null;
    }

    if (input.coverLetterFileId !== undefined) {
      await this.assertFileExists(input.coverLetterFileId);
      data.introductionLetterFileId = input.coverLetterFileId;
    }

    return prisma.internshipApplication.update({ where: { id }, data });
  }

  // ─── 14.4 Submit Application ────────────────────────────────

  public async submit(id: string, userId: string) {
    const app = await this.findOwnedApplication(id, userId);

    if (
      app.status !== ApplicationStatus.DRAFT &&
      app.status !== ApplicationStatus.RESUBMITTED
    ) {
      throw new AppError(
        400,
        "Only DRAFT or RESUBMITTED applications can be submitted",
      );
    }

    // Validate completeness
    if (!app.introductionLetterFileId) {
      throw new AppError(
        400,
        "Cover letter file is required before submitting",
      );
    }
    if (!app.requestedStartDate || !app.requestedEndDate) {
      throw new AppError(
        400,
        "Start and end dates are required before submitting",
      );
    }

    return prisma.internshipApplication.update({
      where: { id },
      data: { status: ApplicationStatus.SUBMITTED },
    });
  }

  // ─── 14.5 Cancel Application ────────────────────────────────

  public async cancel(id: string, userId: string) {
    const app = await this.findOwnedApplication(id, userId);

    if (app.status === ApplicationStatus.APPROVED) {
      throw new AppError(400, "Cannot cancel an already approved application");
    }

    // Soft delete — set status to a terminal-like state. Since the schema
    // lacks a dedicated CANCELLED status, we just hard-delete the draft/submitted
    // application so the intern can create a new one.
    await prisma.internshipApplication.delete({ where: { id } });
    return { message: "Application cancelled and removed" };
  }

  // ─── 14.6 List All Applications (HR) ────────────────────────

  public async list(query: ApplicationQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.keyword) {
      where.OR = [
        { applicationNumber: { contains: query.keyword, mode: "insensitive" } },
        {
          internProfile: {
            user: {
              fullName: { contains: query.keyword, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (query.institution) {
      where.internProfile = {
        ...(where.internProfile as Record<string, unknown> | undefined),
        institution: {
          name: { contains: query.institution, mode: "insensitive" },
        },
      };
    }

    const [data, total] = await prisma.$transaction([
      prisma.internshipApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          internProfile: {
            select: {
              id: true,
              studentNumber: true,
              user: { select: { id: true, fullName: true, email: true } },
              institution: { select: { id: true, name: true } },
              major: { select: { id: true, name: true } },
            },
          },
          introductionLetterFile: {
            select: { id: true, originalName: true, mimeType: true, url: true },
          },
        },
      }),
      prisma.internshipApplication.count({ where }),
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

  // ─── 14.7 Get Application Detail (HR / Supervisor / INTERN own) ─

  public async getById(id: string, userId?: string, roles?: string[]) {
    const app = await prisma.internshipApplication.findUnique({
      where: { id },
      include: {
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            phone: true,
            user: { select: { id: true, fullName: true, email: true } },
            institution: { select: { id: true, name: true } },
            major: { select: { id: true, name: true } },
            profileSkills: {
              select: {
                skill: { select: { id: true, name: true, category: true } },
              },
            },
          },
        },
        introductionLetterFile: {
          select: { id: true, originalName: true, mimeType: true, url: true },
        },
        reviewedBy: { select: { id: true, fullName: true, email: true } },
        internship: { select: { id: true, status: true } },
      },
    });

    if (!app) {
      throw new AppError(404, "Application not found");
    }

    // INTERN hanya boleh melihat aplikasi miliknya sendiri.
    if (roles?.includes("INTERN")) {
      if (!userId) {
        throw new AppError(403, "Forbidden");
      }
      const internProfileId = await this.getInternProfileId(userId);
      if (app.internProfileId !== internProfileId) {
        throw new AppError(403, "You do not own this application");
      }
    }

    return app;
  }

  // ─── 14.8 Approve Application (HR) ──────────────────────────

  public async approve(
    id: string,
    reviewerId: string,
    input: ApproveApplicationBody,
  ) {
    const app = await prisma.internshipApplication.findUnique({
      where: { id },
    });
    if (!app) {
      throw new AppError(404, "Application not found");
    }

    if (
      app.status !== ApplicationStatus.SUBMITTED &&
      app.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new AppError(
        400,
        "Only SUBMITTED or UNDER_REVIEW applications can be approved",
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
    let officeLocationId: string | null = null;
    if (input.officeLocationId) {
      const office = await prisma.officeLocation.findUnique({
        where: { id: input.officeLocationId },
      });
      if (!office) {
        throw new AppError(404, "Office location not found");
      }
      officeLocationId = office.id;
    }

    // Validate supervisor (must be user with SUPERVISOR role)
    const supervisorUser = await prisma.user.findUnique({
      where: { id: input.supervisorId },
      include: {
        userRoles: {
          include: { role: { select: { code: true } } },
        },
      },
    });
    if (!supervisorUser || !supervisorUser.isActive) {
      throw new AppError(404, "Supervisor user not found or inactive");
    }
    const isSupervisor = supervisorUser.userRoles.some(
      (ur) => ur.role?.code === "supervisor",
    );
    if (!isSupervisor) {
      throw new AppError(
        400,
        "Selected user does not have the SUPERVISOR role",
      );
    }

    // Transactional: update application + create internship + create supervisor assignment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update application status to APPROVED
      const updatedApp = await tx.internshipApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });

      // 2. Create internship record
      const internship = await tx.internship.create({
        data: {
          applicationId: id,
          internProfileId: app.internProfileId,
          departmentId: input.departmentId,
          officeLocationId,
          actualStartDate: app.requestedStartDate,
          actualEndDate: app.requestedEndDate,
          status: InternshipStatus.ONBOARDING_PENDING,
          onboardingCompleted: false,
        },
      });

      // 3. Create supervisor assignment
      await tx.supervisorAssignment.create({
        data: {
          internshipId: internship.id,
          supervisorId: input.supervisorId,
          assignedById: reviewerId,
          assignedAt: new Date(),
          isActive: true,
        },
      });

      // 4. Create onboarding history entry
      await tx.onboardingHistory.create({
        data: {
          internshipId: internship.id,
          accepted: null,
        },
      });

      // 5. Record status history
      await tx.internshipStatusHistory.create({
        data: {
          internshipId: internship.id,
          oldStatus: null,
          newStatus: InternshipStatus.ONBOARDING_PENDING,
          changedById: reviewerId,
          notes: input.notes || "Application approved, internship created.",
        },
      });

      return { application: updatedApp, internship };
    });

    return result;
  }

  // ─── 14.9 Reject Application (HR) ──────────────────────────

  public async reject(
    id: string,
    reviewerId: string,
    input: RejectApplicationBody,
  ) {
    const app = await prisma.internshipApplication.findUnique({
      where: { id },
    });
    if (!app) {
      throw new AppError(404, "Application not found");
    }

    if (
      app.status !== ApplicationStatus.SUBMITTED &&
      app.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new AppError(
        400,
        "Only SUBMITTED or UNDER_REVIEW applications can be rejected",
      );
    }

    return prisma.internshipApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: input.reason.trim(),
      },
    });
  }

  // ─── 14.10 Delete Draft Application ─────────────────────────

  public async deleteDraft(id: string, userId: string) {
    const app = await this.findOwnedApplication(id, userId);

    if (app.status !== ApplicationStatus.DRAFT) {
      throw new AppError(400, "Only DRAFT applications can be deleted");
    }

    await prisma.internshipApplication.delete({ where: { id } });
    return { message: "Draft application deleted" };
  }

  // ─── Private Utilities ──────────────────────────────────────

  /** Find an application that belongs to the current user (intern). */
  private async findOwnedApplication(applicationId: string, userId: string) {
    const internProfileId = await this.getInternProfileId(userId);

    const app = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new AppError(404, "Application not found");
    }

    if (app.internProfileId !== internProfileId) {
      throw new AppError(403, "You do not own this application");
    }

    return app;
  }
}

export default new ApplicationService();

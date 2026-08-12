import type { AppContext } from "@/contex";
import internshipController from "@/controllers/InternshipController";
import {
  AssignSupervisorDto,
  ChangeDepartmentDto,
  CreateProfileInternDto,
  ExtendInternshipDto,
  InternshipIdParam,
} from "@/dtos/internship.dto";
import { requireRole, verifyToken } from "@/middlewares/auth";
import { idempotency } from "@/middlewares/idempotency";
import Elysia from "elysia";

const idempotencyMiddleware = idempotency();

/**
 * Routes for the Internship module.
 * Base URL: /internships
 * Source: docs/07-api-specification.md §15
 */
class InternshipRouter {
  public internshipRouter;

  constructor() {
    this.internshipRouter = new Elysia({ prefix: "/internships" });
    this.routes();
  }

  private routes() {
    // ─── Intern Routes ─────────────────────────────────────────

    // 15.1 GET /internships/me — Get my internship (INTERN)
    this.internshipRouter.get(
      "/me",
      (c: AppContext) => internshipController.getMyInternship(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["INTERN"]).beforeHandle,
        ],
      },
    );

    // ─── HR / Admin / Supervisor Routes ────────────────────────

    // 15.2 GET /internships/:id — Internship detail (HR_ADMIN, SUPERVISOR)
    this.internshipRouter.get(
      "/:id",
      (c: AppContext) => internshipController.getById(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN", "SUPERVISOR"]).beforeHandle,
        ],
        params: InternshipIdParam,
      },
    );

    // 15.3 PATCH /internships/:id/start — Start internship (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/start",
      (c: AppContext) => internshipController.start(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        params: InternshipIdParam,
      },
    );

    // 15.4 PATCH /internships/:id/finish — Finish internship (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/finish",
      (c: AppContext) => internshipController.finish(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
          idempotencyMiddleware.beforeHandle,
        ],
        afterHandle: [idempotencyMiddleware.afterHandle],
        params: InternshipIdParam,
      },
    );

    // 15.5 PATCH /internships/:id/extend — Extend internship (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/extend",
      (c: AppContext) => internshipController.extend(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        body: ExtendInternshipDto,
        params: InternshipIdParam,
      },
    );

    // 15.6 PATCH /internships/:id/assign-supervisor — Assign supervisor (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/assign-supervisor",
      (c: AppContext) => internshipController.assignSupervisor(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        body: AssignSupervisorDto,
        params: InternshipIdParam,
      },
    );

    // 15.7 PATCH /internships/:id/change-department — Change department (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/change-department",
      (c: AppContext) => internshipController.changeDepartment(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        body: ChangeDepartmentDto,
        params: InternshipIdParam,
      },
    );

    // 15.8 PATCH /internships/:id/archive — Archive internship (HR_ADMIN)
    this.internshipRouter.patch(
      "/:id/archive",
      (c: AppContext) => internshipController.archive(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        params: InternshipIdParam,
      },
    );
    this.internshipRouter.post(
      "/profile",
      (c: AppContext) => internshipController.internProfile(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["INTERN"]).beforeHandle,
        ],
        body: CreateProfileInternDto,
      },
    );
  }
}

export default new InternshipRouter().internshipRouter;

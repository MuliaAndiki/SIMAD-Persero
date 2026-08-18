import type { AppContext } from "@/contex";
import dashboardController from "@/controllers/DashboardController";
import { RecentActivityQuery } from "@/dtos/dashboard.dto";
import { requireRole, verifyToken } from "@/middlewares/auth";
import Elysia from "elysia";

/**
 * Routes modul Dashboard — endpoint dipisah per role, tidak berbagi prefix
 * `/dashboard` antar role. Setiap role punya namespace sendiri, disamakan
 * dengan folder rute frontend `(private)/<ROLE>/dashboard`:
 * - GET /intern/dashboard                      (INTERN)
 * - GET /hr-admin/dashboard                    (HR_ADMIN)
 * - GET /hr-admin/dashboard/statistics         (HR_ADMIN)
 * - GET /hr-admin/dashboard/charts             (HR_ADMIN)
 * - GET /hr-admin/dashboard/recent-activities  (HR_ADMIN)
 * - GET /supervisor/dashboard                  (SUPERVISOR)
 * Source: docs/07-api-specification.md §19
 */
class DashboardRouter {
  public router;

  constructor() {
    const internRouter = new Elysia({ prefix: "/intern/dashboard" });
    const hrAdminRouter = new Elysia({ prefix: "/hr-admin/dashboard" });
    const supervisorRouter = new Elysia({ prefix: "/supervisor/dashboard" });

    // 19.1 GET /intern/dashboard (INTERN)
    internRouter.get(
      "/",
      (c: AppContext) => dashboardController.internDashboard(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["INTERN"]).beforeHandle,
        ],
      },
    );

    // 19.2 GET /hr-admin/dashboard (HR_ADMIN)
    hrAdminRouter.get(
      "/",
      (c: AppContext) => dashboardController.hrDashboard(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
      },
    );

    // 19.3 GET /supervisor/dashboard (SUPERVISOR)
    supervisorRouter.get(
      "/",
      (c: AppContext) => dashboardController.supervisorDashboard(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["SUPERVISOR"]).beforeHandle,
        ],
      },
    );

    // 19.4 GET /hr-admin/dashboard/statistics (HR_ADMIN)
    hrAdminRouter.get(
      "/statistics",
      (c: AppContext) => dashboardController.statistics(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
      },
    );

    // 19.5 GET /hr-admin/dashboard/charts (HR_ADMIN)
    hrAdminRouter.get(
      "/charts",
      (c: AppContext) => dashboardController.charts(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
      },
    );

    // 19.6 GET /hr-admin/dashboard/recent-activities (HR_ADMIN)
    hrAdminRouter.get(
      "/recent-activities",
      (c: AppContext) => dashboardController.recentActivities(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(["HR_ADMIN"]).beforeHandle,
        ],
        query: RecentActivityQuery,
      },
    );

    this.router = new Elysia()
      .use(internRouter)
      .use(hrAdminRouter)
      .use(supervisorRouter);
  }
}

export default new DashboardRouter().router;

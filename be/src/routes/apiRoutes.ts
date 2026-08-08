import { InternalApiKey } from "@/middlewares/api-key";
import Elysia from "elysia";
import applicationRoutes from "./applicationRoutes";
import attendanceRoutes from "./attendanceRoutes";
import auditLogRoutes from "./auditLogRoutes";
import authRoutes from "./authRoutes";
import certificateRoutes from "./certificateRoutes";
import dashboardRoutes from "./dashboardRoutes";
import departmentRoutes from "./departmentRoutes";
import fileRoutes from "./fileRoutes";
import internshipRoutes from "./internshipRoutes";
import notificationRoutes from "./notificationRoutes";
import officeRoutes from "./officeRoutes";
import reportingRoutes from "./reportingRoutes";
import supervisorRoutes from "./supervisorRoutes";
import userRoutes from "./userRoutes";

class ApiRouter {
  public apiRouter;

  constructor() {
    this.apiRouter = new Elysia({ prefix: "/api/v1" }).derive(() => ({
      json(data: any, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    }));
    this.routes();
  }

  private routes() {
    this.apiRouter
      .use(InternalApiKey)
      .use(authRoutes)
      .use(departmentRoutes)
      .use(officeRoutes)
      .use(userRoutes)
      .use(fileRoutes)
      .use(applicationRoutes)
      .use(internshipRoutes)
      .use(attendanceRoutes)
      .use(certificateRoutes)
      .use(notificationRoutes)
      .use(supervisorRoutes)
      .use(reportingRoutes)
      .use(auditLogRoutes)
      .use(dashboardRoutes);
  }
}

export default new ApiRouter().apiRouter;

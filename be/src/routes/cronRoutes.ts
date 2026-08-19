import Elysia from "elysia";
import cronController from "@/controllers/CronController";

class CronRouter {
  public cronRouter;

  constructor() {
    this.cronRouter = new Elysia({ prefix: "/cron" });
    this.routes();
  }

  private routes() {
    this.cronRouter.get("/internship", async (c: any) => {
      // Typically called by external services like cron-job.org
      return cronController.autoStartInternships(c);
    });
  }
}

export default new CronRouter().cronRouter;

import Elysia from "elysia";
import cronController from "@/controllers/CronController";
import type { AppContext } from "@/contex";

class CronRouter {
  public cronRouter;

  constructor() {
    this.cronRouter = new Elysia({ prefix: "/cron" });
    this.routes();
  }

  private routes() {
    this.cronRouter.get("/internship", async (c: AppContext) => {
      // Typically called by external services like cron-job.org
      return cronController.autoStartInternships(c);
    });
  }
}

export default new CronRouter().cronRouter;

import type { AppContext } from '@/contex';
import cronController from '@/controllers/CronController';
import Elysia from 'elysia';

class CronRouter {
  public cronRouter;

  constructor() {
    this.cronRouter = new Elysia({ prefix: '/cron' });
    this.routes();
  }

  private routes() {
    // Database warm-up / ping (wake up DB connection to avoid cold start)
    this.cronRouter.get('/ping', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });

    this.cronRouter.post('/ping', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });

    this.cronRouter.get('/warmup', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });

    this.cronRouter.post('/warmup', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });

    // Existing internship auto-start
    this.cronRouter.post('/internship', async (c: AppContext) => {
      return cronController.autoStartInternships(c);
    });

    this.cronRouter.get('/cleanup/preview', async (c: AppContext) => {
      return cronController.previewInactiveUsers(c);
    });

    // Delete inactive users (PERMANENT!)
    this.cronRouter.post('/cleanup/users', async (c: AppContext) => {
      return cronController.deleteInactiveUsers(c);
    });

    // Delete orphaned files
    this.cronRouter.post('/cleanup/files', async (c: AppContext) => {
      return cronController.deleteOrphanedFiles(c);
    });
  }
}

export default new CronRouter().cronRouter;

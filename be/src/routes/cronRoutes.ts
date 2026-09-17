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
    this.cronRouter.onBeforeHandle((c: AppContext) => {
      const authHeader = c.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        c.set.status = 401;
        return { success: false, message: 'Unauthorized: Missing or invalid token format' };
      }

      const token = authHeader.substring(7);
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret) {
        c.set.status = 500;
        return { success: false, message: 'Internal Server Error: CRON_SECRET not configured' };
      }

      if (token !== cronSecret) {
        c.set.status = 403;
        return { success: false, message: 'Forbidden: Invalid cron secret' };
      }
    });

    // Database warm-up / ping (wake up DB connection to avoid cold start)
    this.cronRouter.get('/ping', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });
    this.cronRouter.post('/ping', async (c: AppContext) => {
      return cronController.pingDatabase(c);
    });

    this.cronRouter.get('/warmup', async (c: AppContext) => {
      return cronController.PingService(c);
    });
    this.cronRouter.post('/warmup', async (c: AppContext) => {
      return cronController.PingService(c);
    });

    // Internship automation: auto-start (PENDING -> ACTIVE) and auto-complete (ACTIVE -> COMPLETED)
    this.cronRouter.get('/internship', async (c: AppContext) => {
      return cronController.autoStartInternships(c);
    });
    this.cronRouter.post('/internship', async (c: AppContext) => {
      return cronController.autoStartInternships(c);
    });

    this.cronRouter.get('/cleanup/preview', async (c: AppContext) => {
      return cronController.previewInactiveUsers(c);
    });

    // Delete inactive users (PERMANENT!)
    this.cronRouter.get('/cleanup/users', async (c: AppContext) => {
      return cronController.deleteInactiveUsers(c);
    });
    this.cronRouter.post('/cleanup/users', async (c: AppContext) => {
      return cronController.deleteInactiveUsers(c);
    });

    // Delete orphaned files
    this.cronRouter.get('/cleanup/files', async (c: AppContext) => {
      return cronController.deleteOrphanedFiles(c);
    });
    this.cronRouter.post('/cleanup/files', async (c: AppContext) => {
      return cronController.deleteOrphanedFiles(c);
    });
  }
}

export default new CronRouter().cronRouter;

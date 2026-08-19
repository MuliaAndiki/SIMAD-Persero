import type { AppContext } from '@/contex';
import cronController from '@/controllers/CronController';
import Elysia from 'elysia';

class CronRouter {
  public cronRouter;

  constructor() {
    this.cronRouter = new Elysia({ prefix: '/api/cron' });
    this.routes();
  }

  private routes() {
    this.cronRouter.get('/internship', async (c: AppContext) => {
      return cronController.autoStartInternships(c);
    });
  }
}

export default new CronRouter().cronRouter;

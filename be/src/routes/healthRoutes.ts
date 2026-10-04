import type { AppContext } from '@/contex';
import healthController from '@/controllers/HealthController';
import Elysia from 'elysia';

class HealthRouter {
  public healthRouter;

  constructor() {
    this.healthRouter = new Elysia({ prefix: '/health' });
    this.routes();
  }

  private routes() {
    // Health check with DB ping (wakes up backend server & PostgreSQL connection pool)
    this.healthRouter.get('/', async (c: AppContext) => healthController.check(c));
    this.healthRouter.post('/', async (c: AppContext) => healthController.check(c));

    this.healthRouter.get('/ping', async (c: AppContext) => healthController.check(c));
    this.healthRouter.post('/ping', async (c: AppContext) => healthController.check(c));

    // Lightweight warmup (without querying database)
    this.healthRouter.get('/warmup', async (c: AppContext) => healthController.warmup(c));
    this.healthRouter.post('/warmup', async (c: AppContext) => healthController.warmup(c));
  }
}

export default new HealthRouter().healthRouter;

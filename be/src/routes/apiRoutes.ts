import Elysia from 'elysia';
import authRoutes from './authRoutes';
import { InternalApiKey } from '@/middlewares/api-key';

class ApiRouter {
  public apiRouter;

  constructor() {
    this.apiRouter = new Elysia({ prefix: '/api/v1' }).derive(() => ({
      json(data: any, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    }));
    this.routes();
  }

  private routes() {
    this.apiRouter.use(InternalApiKey).use(authRoutes);
  }
}

export default new ApiRouter().apiRouter;

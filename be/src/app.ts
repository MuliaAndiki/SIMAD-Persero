import cors from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import Elysia from 'elysia';
import apiRoutes from './routes/apiRoutes';

class App {
  public app: Elysia;

  constructor() {
    this.app = new Elysia();
    this.middlewares();
    this.routes();
  }
  private routes(): void {
    this.app.get('/', () => 'Hello Elysia! Bun js');
  }
  private middlewares() {
    this.app.use(helmet());
    this.app.use(cors({ origin: '*' }));
    this.app.use(apiRoutes);
  }
}

export default new App().app;

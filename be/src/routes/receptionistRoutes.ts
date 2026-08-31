import type { AppContext } from '@/contex';
import receptionistController from '@/controllers/ReceptionistController';
import {
  CreateReceptionistDto,
  ReceptionistIdParam,
  ReceptionistListQuery,
  UpdateReceptionistDto,
} from '@/dtos/receptionist.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Receptionist.
 * Base URL: /receptionists
 */
class ReceptionistRouter {
  public receptionistRouter;

  constructor() {
    this.receptionistRouter = new Elysia({ prefix: '/receptionists' });
    this.routes();
  }

  private routes() {
    // 1. GET /receptionists (HR_ADMIN) - List all receptionists
    this.receptionistRouter.get('/', (c: AppContext) => receptionistController.list(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      query: ReceptionistListQuery,
    });

    // 2. POST /receptionists (HR_ADMIN) - Create receptionist account
    this.receptionistRouter.post('/', (c: AppContext) => receptionistController.createAccount(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      body: CreateReceptionistDto,
    });

    // 3. GET /receptionists/:receptionistId (HR_ADMIN) - Detail receptionist
    this.receptionistRouter.get(
      '/:receptionistId',
      (c: AppContext) => receptionistController.detail(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: ReceptionistIdParam,
      },
    );

    // 4. PATCH /receptionists/:receptionistId (HR_ADMIN) - Update receptionist
    this.receptionistRouter.patch(
      '/:receptionistId',
      (c: AppContext) => receptionistController.updateAccount(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: ReceptionistIdParam,
        body: UpdateReceptionistDto,
      },
    );

    // 5. DELETE /receptionists/:receptionistId (HR_ADMIN) - Delete receptionist
    this.receptionistRouter.delete(
      '/:receptionistId',
      (c: AppContext) => receptionistController.deleteAccount(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: ReceptionistIdParam,
      },
    );
  }
}

export default new ReceptionistRouter().receptionistRouter;

import type { AppContext } from '@/contex';
import quotaController from '@/controllers/QuotaController';
import {
  CreateQuotaDto,
  QuotaAvailabilityQueryDto,
  QuotaIdParam,
  QuotaListQuery,
  UpdateQuotaDto,
} from '@/dtos/quota.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes for the Internship Quota module.
 * Base URL: /internship-quotas
 */
class QuotaRouter {
  public quotaRouter;

  constructor() {
    this.quotaRouter = new Elysia({ prefix: '/internship-quotas' });
    this.routes();
  }

  private routes() {
    // GET /internship-quotas/availability — Check slot availability (HR_ADMIN, RECEPTIONIST, SUPERVISOR)
    this.quotaRouter.get(
      '/availability',
      (c: AppContext) => quotaController.availability(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin', 'receptionist', 'supervisor']).beforeHandle,
        ],
        query: QuotaAvailabilityQueryDto,
      },
    );

    // GET /internship-quotas — List quotas (HR_ADMIN, RECEPTIONIST)
    this.quotaRouter.get(
      '/',
      (c: AppContext) => quotaController.list(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin', 'receptionist']).beforeHandle,
        ],
        query: QuotaListQuery,
      },
    );

    // GET /internship-quotas/:id — Detail quota (HR_ADMIN)
    this.quotaRouter.get(
      '/:id',
      (c: AppContext) => quotaController.detail(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin']).beforeHandle,
        ],
        params: QuotaIdParam,
      },
    );

    // POST /internship-quotas — Create quota (HR_ADMIN)
    this.quotaRouter.post(
      '/',
      (c: AppContext) => quotaController.create(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin']).beforeHandle,
        ],
        body: CreateQuotaDto,
      },
    );

    // PATCH /internship-quotas/:id — Update quota (HR_ADMIN)
    this.quotaRouter.patch(
      '/:id',
      (c: AppContext) => quotaController.update(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin']).beforeHandle,
        ],
        body: UpdateQuotaDto,
        params: QuotaIdParam,
      },
    );

    // DELETE /internship-quotas/:id — Remove quota (HR_ADMIN)
    this.quotaRouter.delete(
      '/:id',
      (c: AppContext) => quotaController.remove(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['hr_admin']).beforeHandle,
        ],
        params: QuotaIdParam,
      },
    );
  }
}

export default new QuotaRouter().quotaRouter;

import type { AppContext } from '@/contex';
import applicationController from '@/controllers/ApplicationController';
import {
  ApplicationIdParam,
  ApplicationListQuery,
  ApproveApplicationDto,
  CreateApplicationDto,
  RejectApplicationDto,
  UpdateApplicationDto,
} from '@/dtos/application.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import { idempotency } from '@/middlewares/idempotency';
import Elysia from 'elysia';

const idempotencyMiddleware = idempotency();

/**
 * Routes for the Internship Application module.
 * Base URL: /applications
 * Source: docs/07-api-specification.md §14
 */
class ApplicationRouter {
  public applicationRouter;

  constructor() {
    this.applicationRouter = new Elysia({ prefix: '/applications' });
    this.routes();
  }

  private routes() {
    // ─── Intern Routes ─────────────────────────────────────────

    // 14.1 POST /applications — Create application (INTERN)
    this.applicationRouter.post('/', (c: AppContext) => applicationController.create(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      body: CreateApplicationDto,
    });

    // 14.2 GET /applications/me — Get my applications (INTERN)
    this.applicationRouter.get(
      '/me',
      (c: AppContext) => applicationController.getMyApplications(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      },
    );

    // 14.3 PATCH /applications/:id — Update draft (INTERN)
    this.applicationRouter.patch('/:id', (c: AppContext) => applicationController.updateDraft(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      body: UpdateApplicationDto,
      params: ApplicationIdParam,
    });

    // 14.4 POST /applications/:id/submit — Submit application (INTERN)
    this.applicationRouter.post('/:id/submit', (c: AppContext) => applicationController.submit(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      params: ApplicationIdParam,
    });

    // 14.5 POST /applications/:id/cancel — Cancel application (INTERN)
    this.applicationRouter.post('/:id/cancel', (c: AppContext) => applicationController.cancel(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      params: ApplicationIdParam,
    });

    // 14.10 DELETE /applications/:id — Delete draft (INTERN)
    this.applicationRouter.delete('/:id', (c: AppContext) => applicationController.deleteDraft(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      params: ApplicationIdParam,
    });

    // ─── HR / Admin Routes ─────────────────────────────────────

    // 14.6 GET /applications — List all applications (HR_ADMIN)
    this.applicationRouter.get('/', (c: AppContext) => applicationController.list(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      query: ApplicationListQuery,
    });

    // 14.7 GET /applications/:id — Application detail (HR_ADMIN, SUPERVISOR, INTERN own)
    this.applicationRouter.get('/:id', (c: AppContext) => applicationController.getById(c), {
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['HR_ADMIN', 'SUPERVISOR', 'INTERN']).beforeHandle,
      ],
      params: ApplicationIdParam,
    });

    // 14.8 PATCH /applications/:id/approve — Approve (HR_ADMIN)
    this.applicationRouter.patch(
      '/:id/approve',
      (c: AppContext) => applicationController.approve(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['HR_ADMIN']).beforeHandle,
          idempotencyMiddleware.beforeHandle,
        ],
        afterHandle: [idempotencyMiddleware.afterHandle],
        body: ApproveApplicationDto,
        params: ApplicationIdParam,
      },
    );

    // 14.9 PATCH /applications/:id/reject — Reject (HR_ADMIN)
    this.applicationRouter.patch(
      '/:id/reject',
      (c: AppContext) => applicationController.reject(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['HR_ADMIN']).beforeHandle,
          idempotencyMiddleware.beforeHandle,
        ],
        afterHandle: [idempotencyMiddleware.afterHandle],
        body: RejectApplicationDto,
        params: ApplicationIdParam,
      },
    );
  }
}

export default new ApplicationRouter().applicationRouter;

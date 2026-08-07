import type { AppContext } from '@/contex';
import certificateController from '@/controllers/CertificateController';
import {
  CertificateIdParam,
  CertificateVerifyParam,
  GenerateCertificateDto,
} from '@/dtos/certificate.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import { idempotency } from '@/middlewares/idempotency';
import Elysia from 'elysia';

const idempotencyMiddleware = idempotency();

/**
 * Routes modul Certificate.
 * Base URL: /certificates
 * Source: docs/07-api-specification.md §17
 */
class CertificateRouter {
  public certificateRouter;

  constructor() {
    this.certificateRouter = new Elysia({ prefix: '/certificates' });
    this.routes();
  }

  private routes() {
    // ─── Public Routes ─────────────────────────────────────────────

    // 17.5 GET /certificates/verify/:verificationCode (PUBLIC)
    this.certificateRouter.get(
      '/verify/:verificationCode',
      (c: AppContext) => certificateController.verify(c),
      {
        params: CertificateVerifyParam,
      },
    );

    // ─── Intern Routes ─────────────────────────────────────────────

    // 17.1 GET /certificates/me (INTERN)
    this.certificateRouter.get(
      '/me',
      (c: AppContext) => certificateController.getMyCertificate(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['INTERN']).beforeHandle],
      },
    );

    // ─── HR Admin Routes ───────────────────────────────────────────

    // 17.4 POST /certificates/generate (HR_ADMIN)
    this.certificateRouter.post('/generate', (c: AppContext) => certificateController.generate(c), {
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['HR_ADMIN']).beforeHandle,
        idempotencyMiddleware.beforeHandle,
      ],
      afterHandle: [idempotencyMiddleware.afterHandle],
      body: GenerateCertificateDto,
    });

    // ─── Detail Routes (must be after static routes) ───────────────

    // 17.2 GET /certificates/:certificateId/download (INTERN owner, HR_ADMIN, SUPERVISOR)
    this.certificateRouter.get(
      '/:certificateId/download',
      (c: AppContext) => certificateController.download(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR']).beforeHandle,
        ],
        params: CertificateIdParam,
      },
    );

    // 17.3 GET /certificates/:certificateId (INTERN owner, HR_ADMIN, SUPERVISOR)
    this.certificateRouter.get(
      '/:certificateId',
      (c: AppContext) => certificateController.getById(c),
      {
        beforeHandle: [
          verifyToken().beforeHandle,
          requireRole(['INTERN', 'HR_ADMIN', 'SUPERVISOR']).beforeHandle,
        ],
        params: CertificateIdParam,
      },
    );

    // 17.6 POST /certificates/:certificateId/regenerate (HR_ADMIN)
    this.certificateRouter.post(
      '/:certificateId/regenerate',
      (c: AppContext) => certificateController.regenerate(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
        params: CertificateIdParam,
      },
    );
  }
}

export default new CertificateRouter().certificateRouter;

import type { AppContext } from '@/contex';
import certificateController from '@/controllers/CertificateController';
import {
  ApproveCertificateDto,
  CertificateIdParam,
  CertificateListQuery,
  CertificateParamId,
  CertificateVerifyParam,
  GenerateCertificateDto,
  OfficeLocationIdParam,
  RejectCertificateDto,
  UpdateCertificateSettingsDto,
  UpsertCertificateSettingDto,
} from '@/dtos/certificate.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import { idempotency } from '@/middlewares/idempotency';
import Elysia from 'elysia';

const idempotencyMiddleware = idempotency();

/**
 * Routes modul Certificate & Multi-Office Certificate Settings (v1.0.1).
 */
class CertificateRouter {
  public certificateRouter;

  constructor() {
    this.certificateRouter = new Elysia();
    this.routes();
  }

  private routes() {
    // ─── Certificate Routes Prefix /certificates ──────────────────
    this.certificateRouter.group('/certificates', (app) =>
      app
        // 17.5 GET /certificates/verify/:verificationCode (PUBLIC)
        .get(
          '/verify/:verificationCode',
          (c: AppContext) => certificateController.verify(c),
          { params: CertificateVerifyParam },
        )

        // GET /certificates/pending-approval (HR_ADMIN)
        .get(
          '/pending-approval',
          (c: AppContext) => certificateController.getPendingApprovals(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            query: CertificateListQuery,
          },
        )

        // GET /certificates (HR_ADMIN list all)
        .get(
          '/',
          (c: AppContext) => certificateController.list(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            query: CertificateListQuery,
          },
        )

        // 17.1 GET /certificates/me (INTERN)
        .get(
          '/me',
          (c: AppContext) => certificateController.getMyCertificate(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['intern']).beforeHandle],
          },
        )

        // GET /certificates/me/download (INTERN)
        .get(
          '/me/download',
          (c: AppContext) => certificateController.downloadMine(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['intern']).beforeHandle],
          },
        )

        // 17.4 POST /certificates/generate (HR_ADMIN)
        .post(
          '/generate',
          (c: AppContext) => certificateController.generate(c),
          {
            beforeHandle: [
              verifyToken().beforeHandle,
              requireRole(['hr_admin']).beforeHandle,
              idempotencyMiddleware.beforeHandle,
            ],
            afterHandle: [idempotencyMiddleware.afterHandle],
            body: GenerateCertificateDto,
          },
        )

        // PATCH /certificates/:id/approve (HR_ADMIN)
        .patch(
          '/:id/approve',
          (c: AppContext) => certificateController.approve(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            params: CertificateParamId,
            body: ApproveCertificateDto,
          },
        )

        // PATCH /certificates/:id/reject (HR_ADMIN)
        .patch(
          '/:id/reject',
          (c: AppContext) => certificateController.reject(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            params: CertificateParamId,
            body: RejectCertificateDto,
          },
        )

        // 17.2 GET /certificates/:certificateId/download (INTERN owner, HR_ADMIN, SUPERVISOR)
        .get(
          '/:certificateId/download',
          (c: AppContext) => certificateController.download(c),
          {
            beforeHandle: [
              verifyToken().beforeHandle,
              requireRole(['intern', 'hr_admin', 'supervisor']).beforeHandle,
            ],
            params: CertificateIdParam,
          },
        )

        // 17.3 GET /certificates/:certificateId (INTERN owner, HR_ADMIN, SUPERVISOR)
        .get(
          '/:certificateId',
          (c: AppContext) => certificateController.getById(c),
          {
            beforeHandle: [
              verifyToken().beforeHandle,
              requireRole(['intern', 'hr_admin', 'supervisor']).beforeHandle,
            ],
            params: CertificateIdParam,
          },
        ),
    );

    // ─── Certificate Settings per Office Prefix /certificate-settings
    this.certificateRouter.group('/certificate-settings', (app) =>
      app
        // GET /certificate-settings (HR_ADMIN)
        .get(
          '/',
          (c: AppContext) => certificateController.listOfficeSettings(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
          },
        )
        // GET /certificate-settings/:officeLocationId (HR_ADMIN)
        .get(
          '/:officeLocationId',
          (c: AppContext) => certificateController.getOfficeSetting(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            params: OfficeLocationIdParam,
          },
        )
        // POST /certificate-settings (HR_ADMIN)
        .post(
          '/',
          (c: AppContext) => certificateController.saveOfficeSetting(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            body: UpsertCertificateSettingDto,
          },
        )
        // PATCH /certificate-settings/:id (HR_ADMIN)
        .patch(
          '/:id',
          (c: AppContext) => certificateController.saveOfficeSetting(c),
          {
            beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
            body: UpsertCertificateSettingDto,
          },
        ),
    );
  }
}

export default new CertificateRouter().certificateRouter;

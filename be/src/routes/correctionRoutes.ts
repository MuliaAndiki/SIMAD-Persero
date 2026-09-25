import type { AppContext } from '@/contex';
import correctionController from '@/controllers/CorrectionController';
import {
  ApproveCorrectionDto,
  CorrectionIdParam,
  CorrectionListQuery,
  CreateCorrectionDto,
  RejectCorrectionDto,
} from '@/dtos/correction.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

class CorrectionRouter {
  public correctionRouter;

  constructor() {
    this.correctionRouter = new Elysia();
    this.routes();
  }

  private routes() {
    // ─── Intern Endpoints ──────────────────────────────────────────
    this.correctionRouter.group('/attendance/corrections', (app) =>
      app
        // POST /attendance/corrections (INTERN)
        .post('/', (c: AppContext) => correctionController.create(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['intern']).beforeHandle],
          body: CreateCorrectionDto,
        })
        // GET /attendance/corrections/me (INTERN)
        .get('/me', (c: AppContext) => correctionController.getMyCorrections(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['intern']).beforeHandle],
          query: CorrectionListQuery,
        })
        // GET /attendance/corrections/:id (INTERN, SUPERVISOR, HR_ADMIN)
        .get('/:id', (c: AppContext) => correctionController.getDetail(c), {
          beforeHandle: [
            verifyToken().beforeHandle,
            requireRole(['intern', 'supervisor', 'hr_admin']).beforeHandle,
          ],
          params: CorrectionIdParam,
        })
        // POST /attendance/corrections/:id/cancel (INTERN)
        .post('/:id/cancel', (c: AppContext) => correctionController.cancel(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['intern']).beforeHandle],
          params: CorrectionIdParam,
        }),
    );

    // ─── Supervisor Endpoints ──────────────────────────────────────
    this.correctionRouter.group('/supervisor/attendance-corrections', (app) =>
      app
        // GET /supervisor/attendance-corrections (SUPERVISOR, HR_ADMIN)
        .get('/', (c: AppContext) => correctionController.listForSupervisor(c), {
          beforeHandle: [
            verifyToken().beforeHandle,
            requireRole(['supervisor', 'hr_admin']).beforeHandle,
          ],
          query: CorrectionListQuery,
        })
        // PATCH /supervisor/attendance-corrections/:id/approve (SUPERVISOR)
        .patch('/:id/approve', (c: AppContext) => correctionController.approve(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['supervisor']).beforeHandle],
          params: CorrectionIdParam,
          body: ApproveCorrectionDto,
        })
        // PATCH /supervisor/attendance-corrections/:id/reject (SUPERVISOR)
        .patch('/:id/reject', (c: AppContext) => correctionController.reject(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['supervisor']).beforeHandle],
          params: CorrectionIdParam,
          body: RejectCorrectionDto,
        }),
    );
  }
}

export default new CorrectionRouter().correctionRouter;

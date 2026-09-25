import type { AppContext } from '@/contex';
import evaluationController from '@/controllers/EvaluationController';
import {
  EvaluationListQuery,
  InternshipIdParam,
  SaveEvaluationDto,
} from '@/dtos/evaluation.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

class EvaluationRouter {
  public evaluationRouter;

  constructor() {
    this.evaluationRouter = new Elysia();
    this.routes();
  }

  private routes() {
    // ─── Supervisor & Intern Evaluation Endpoints ──────────────────
    this.evaluationRouter.group('/supervisor/internships', (app) =>
      app
        // GET /supervisor/internships/:id/evaluation (SUPERVISOR, HR_ADMIN, INTERN)
        .get('/:id/evaluation', (c: AppContext) => evaluationController.getEvaluation(c), {
          beforeHandle: [
            verifyToken().beforeHandle,
            requireRole(['supervisor', 'hr_admin', 'intern']).beforeHandle,
          ],
          params: InternshipIdParam,
        })
        // POST /supervisor/internships/:id/evaluation (SUPERVISOR save draft)
        .post('/:id/evaluation', (c: AppContext) => evaluationController.saveDraft(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['supervisor']).beforeHandle],
          params: InternshipIdParam,
          body: SaveEvaluationDto,
        })
        // PATCH /supervisor/internships/:id/evaluation (SUPERVISOR update draft)
        .patch('/:id/evaluation', (c: AppContext) => evaluationController.updateDraft(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['supervisor']).beforeHandle],
          params: InternshipIdParam,
          body: SaveEvaluationDto,
        })
        // POST /supervisor/internships/:id/evaluation/submit (SUPERVISOR finalize)
        .post('/:id/evaluation/submit', (c: AppContext) => evaluationController.submit(c), {
          beforeHandle: [verifyToken().beforeHandle, requireRole(['supervisor']).beforeHandle],
          params: InternshipIdParam,
          body: SaveEvaluationDto,
        }),
    );

    // ─── HR Admin Evaluation Monitoring ────────────────────────────
    this.evaluationRouter.group('/hr-admin/evaluations', (app) =>
      app.get('/', (c: AppContext) => evaluationController.listAll(c), {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        query: EvaluationListQuery,
      }),
    );
  }
}

export default new EvaluationRouter().evaluationRouter;

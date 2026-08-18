import type { AppContext } from '@/contex';
import supervisorController from '@/controllers/SupervisorController';
import {
  AssignInternDto,
  CreateSupervisorDto,
  UpdateSupervisorDto,
  SupervisorAssignmentParam,
  SupervisorIdParam,
  SupervisorListQuery,
} from '@/dtos/supervisor.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Supervisor.
 * Base URL: /supervisors
 * Source: docs/07-api-specification.md §24
 */
class SupervisorRouter {
  public supervisorRouter;

  constructor() {
    this.supervisorRouter = new Elysia({ prefix: '/supervisors' });
    this.routes();
  }

  private routes() {
    // ─── Static Routes (must be before dynamic /:supervisorId) ─────

    // 24.5 GET /supervisors/dashboard (SUPERVISOR)
    this.supervisorRouter.get('/dashboard', (c: AppContext) => supervisorController.dashboard(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['SUPERVISOR']).beforeHandle],
    });

    // 24.1 GET /supervisors (HR_ADMIN)
    this.supervisorRouter.get('/', (c: AppContext) => supervisorController.list(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      query: SupervisorListQuery,
    });

    // ─── Dynamic Routes ───────────────────────────────────────────────

    
    // POST /supervisors (HR_ADMIN) - Create Supervisor
    this.supervisorRouter.post('/', (c: AppContext) => supervisorController.createAccount(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      body: CreateSupervisorDto,
    });

    // PATCH /supervisors/:supervisorId (HR_ADMIN) - Update Supervisor
    this.supervisorRouter.patch('/:supervisorId', (c: AppContext) => supervisorController.updateAccount(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      params: SupervisorIdParam,
      body: UpdateSupervisorDto,
    });

    // DELETE /supervisors/:supervisorId (HR_ADMIN) - Delete Supervisor
    this.supervisorRouter.delete('/:supervisorId', (c: AppContext) => supervisorController.deleteAccount(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      params: SupervisorIdParam,
    });

    // 24.2 GET /supervisors/:supervisorId (HR_ADMIN)
    this.supervisorRouter.get('/:supervisorId', (c: AppContext) => supervisorController.detail(c), {
      beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
      params: SupervisorIdParam,
    });

    // 24.3 POST /supervisors/:supervisorId/assign (HR_ADMIN)
    this.supervisorRouter.post(
      '/:supervisorId/assign',
      (c: AppContext) => supervisorController.assign(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
        params: SupervisorIdParam,
        body: AssignInternDto,
      },
    );

    // 24.4 DELETE /supervisors/:supervisorId/assignments/:assignmentId (HR_ADMIN)
    this.supervisorRouter.delete(
      '/:supervisorId/assignments/:assignmentId',
      (c: AppContext) => supervisorController.removeAssignment(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['HR_ADMIN']).beforeHandle],
        params: SupervisorAssignmentParam,
      },
    );
  }
}

export default new SupervisorRouter().supervisorRouter;

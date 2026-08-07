import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import internshipService from '@/services/internship.service';
import type {
  AssignSupervisorBody,
  ChangeDepartmentBody,
  ExtendInternshipBody,
} from '@/types/internship.types';

/**
 * Thin controller for the Internship module.
 * Delegates all business logic to InternshipService.
 * Source: docs/07-api-specification.md §15
 */
class InternshipController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /internships/me
  public async getMyInternship(c: AppContext) {
    try {
      const data = await internshipService.getMyInternship(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /internships/:id
  public async getById(c: AppContext) {
    try {
      const data = await internshipService.getById(c.params.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/start
  public async start(c: AppContext) {
    try {
      const data = await internshipService.start(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data, undefined, 'Internship started');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/finish
  public async finish(c: AppContext) {
    try {
      const data = await internshipService.finish(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data, undefined, 'Internship completed');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/extend
  public async extend(c: AppContext) {
    try {
      const body = c.body as unknown as ExtendInternshipBody;
      const data = await internshipService.extend(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Internship extended');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/assign-supervisor
  public async assignSupervisor(c: AppContext) {
    try {
      const body = c.body as unknown as AssignSupervisorBody;
      const data = await internshipService.assignSupervisor(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Supervisor assigned');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/change-department
  public async changeDepartment(c: AppContext) {
    try {
      const body = c.body as unknown as ChangeDepartmentBody;
      const data = await internshipService.changeDepartment(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Department changed');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internships/:id/archive
  public async archive(c: AppContext) {
    try {
      const data = await internshipService.archive(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data, undefined, 'Internship archived');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new InternshipController();

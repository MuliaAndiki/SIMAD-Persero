import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import applicationService from '@/services/application.service';
import type {
  ApplicationQuery,
  ApproveApplicationBody,
  CreateApplicationBody,
  RejectApplicationBody,
  UpdateApplicationBody,
} from '@/types/application.types';

/**
 * Thin controller for the Internship Application module.
 * Delegates all business logic to ApplicationService.
 * Source: docs/07-api-specification.md §14
 */
class ApplicationController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // POST /applications
  public async create(c: AppContext) {
    try {
      const body = c.body as unknown as CreateApplicationBody;
      const data = await applicationService.create(c.user!.id, body);
      return HttpResponse(c).created(data, 'Application created');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /applications/me
  public async getMyApplications(c: AppContext) {
    try {
      const data = await applicationService.getMyApplications(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /applications/:id
  public async updateDraft(c: AppContext) {
    try {
      const body = c.body as unknown as UpdateApplicationBody;
      const data = await applicationService.updateDraft(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Application updated');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /applications/:id/submit
  public async submit(c: AppContext) {
    try {
      const data = await applicationService.submit(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data, undefined, 'Application submitted');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /applications/:id/cancel
  public async cancel(c: AppContext) {
    try {
      const data = await applicationService.cancel(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /applications (HR list)
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as ApplicationQuery;
      const { data, meta } = await applicationService.list(query);
      return HttpResponse(c).ok(data, meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /applications/:id
  public async getById(c: AppContext) {
    try {
      const data = await applicationService.getById(c.params.id, c.user!.id, c.user!.roles);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /applications/:id/approve
  public async approve(c: AppContext) {
    try {
      const body = c.body as unknown as ApproveApplicationBody;
      const data = await applicationService.approve(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Application approved');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /applications/:id/reject
  public async reject(c: AppContext) {
    try {
      const body = c.body as unknown as RejectApplicationBody;
      const data = await applicationService.reject(c.params.id, c.user!.id, body);
      return HttpResponse(c).ok(data, undefined, 'Application rejected');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /applications/:id
  public async deleteDraft(c: AppContext) {
    try {
      const data = await applicationService.deleteDraft(c.params.id, c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new ApplicationController();

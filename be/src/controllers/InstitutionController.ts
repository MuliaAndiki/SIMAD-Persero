import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import InstitutionService from '../services/institution.service';

/**
 * Controller layer modul Institution.
 * Menangani HTTP request/response dan memanggil Service layer.
 */
class InstitutionController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /institutions
  public async list(c: AppContext) {
    try {
      const query = c.query as {
        page?: number;
        limit?: number;
        keyword?: string;
        educationLevelId?: string;
      };
      const result = await InstitutionService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Institutions retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /institutions/education-levels
  public async getEducationLevels(c: AppContext) {
    try {
      const data = await InstitutionService.getEducationLevels();
      return HttpResponse(c).ok(data, undefined, 'Education levels retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /institutions/:institutionId
  public async detail(c: AppContext) {
    try {
      const { institutionId } = c.params as { institutionId: string };
      const data = await InstitutionService.getById(institutionId);
      return HttpResponse(c).ok(data, undefined, 'Institution detail retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /institutions
  public async create(c: AppContext) {
    try {
      const body = c.body as {
        name: string;
        shortName?: string;
        educationLevelId?: string;
        province?: string;
        city?: string;
        logo?: string;
      };
      const data = await InstitutionService.create(body);
      return HttpResponse(c).created(data, 'Institution created successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PUT /institutions/:institutionId
  public async update(c: AppContext) {
    try {
      const { institutionId } = c.params as { institutionId: string };
      const body = c.body as {
        name?: string;
        shortName?: string;
        educationLevelId?: string;
        province?: string;
        city?: string;
        logo?: string;
      };
      const data = await InstitutionService.update(institutionId, body);
      return HttpResponse(c).ok(data, undefined, 'Institution updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /institutions/:institutionId
  public async delete(c: AppContext) {
    try {
      const { institutionId } = c.params as { institutionId: string };
      await InstitutionService.delete(institutionId);
      return HttpResponse(c).ok(null, undefined, 'Institution deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new InstitutionController();

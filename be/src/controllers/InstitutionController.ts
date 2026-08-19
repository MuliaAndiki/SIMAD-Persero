import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import InstitutionService from '@/services/institution.service';
import type { InstitutionParams, InstitutionQuery } from '@/types/institution.types';

/**
 * Controller modul Institution — tipis.
 * Mengekstrak input dari context (query/params), memanggil `InstitutionService`,
 * lalu memetakan hasil ke respons HTTP menggunakan helper resmi `HttpResponse` dari `@/http`.
 */
class InstitutionController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /institutions
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as InstitutionQuery;
      const result = await InstitutionService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Institutions retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /institutions/:institutionId
  public async detail(c: AppContext) {
    try {
      const { institutionId } = c.params as unknown as InstitutionParams;
      const data = await InstitutionService.getById(institutionId);
      return HttpResponse(c).ok(data, undefined, 'Institution retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new InstitutionController();

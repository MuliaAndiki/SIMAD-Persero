import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import OfficeService from '@/services/office.service';
import type {
  CreateOfficeBody,
  OfficeParams,
  OfficeQuery,
  UpdateOfficeBody,
} from '@/types/office.types';

/**
 * Controller modul Office (Office Location) — tipis.
 * Mengekstrak input dari context (body/params/query/user), memanggil
 * `OfficeService`, lalu memetakan hasil ke respons HTTP menggunakan
 * helper resmi `HttpResponse` dari `@/http`.
 * Sumber aturan: docs/07-api-specification.md §23.
 */
class OfficeController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /offices
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as OfficeQuery;
      const result = await OfficeService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Offices retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /offices/:officeId
  public async detail(c: AppContext) {
    try {
      const { officeId } = c.params as unknown as OfficeParams;
      const data = await OfficeService.getById(officeId);
      return HttpResponse(c).ok(data, undefined, 'Office retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /offices
  public async create(c: AppContext) {
    try {
      const body = c.body as CreateOfficeBody;
      const data = await OfficeService.create(body);
      return HttpResponse(c).created(data, 'Office created successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /offices/:officeId
  public async update(c: AppContext) {
    try {
      const { officeId } = c.params as unknown as OfficeParams;
      const body = c.body as UpdateOfficeBody;
      const data = await OfficeService.update(officeId, body);
      return HttpResponse(c).ok(data, undefined, 'Office updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /offices/:officeId
  public async remove(c: AppContext) {
    try {
      const { officeId } = c.params as unknown as OfficeParams;
      await OfficeService.remove(officeId);
      return HttpResponse(c).ok(undefined, undefined, 'Office deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new OfficeController();

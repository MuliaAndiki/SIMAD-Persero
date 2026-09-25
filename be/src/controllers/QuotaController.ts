import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import QuotaService from '@/services/quota.service';
import type {
  CreateQuotaBody,
  QuotaAvailabilityQuery,
  QuotaQuery,
  UpdateQuotaBody,
} from '@/types/quota.types';

class QuotaController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /internship-quotas
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as QuotaQuery;
      const result = await QuotaService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Daftar kuota magang berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /internship-quotas/availability
  public async availability(c: AppContext) {
    try {
      const query = c.query as unknown as QuotaAvailabilityQuery;
      const result = await QuotaService.checkAvailability(query);
      return HttpResponse(c).ok(result, undefined, 'Informasi ketersediaan slot magang berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /internship-quotas/:id
  public async detail(c: AppContext) {
    try {
      const { id } = c.params;
      const data = await QuotaService.getById(id);
      return HttpResponse(c).ok(data, undefined, 'Detail kuota magang berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /internship-quotas
  public async create(c: AppContext) {
    try {
      const body = c.body as CreateQuotaBody;
      const userId = c.user?.id;
      const data = await QuotaService.create(userId, body);
      return HttpResponse(c).created(data, 'Alokasi kuota magang berhasil dibuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /internship-quotas/:id
  public async update(c: AppContext) {
    try {
      const { id } = c.params;
      const body = c.body as UpdateQuotaBody;
      const data = await QuotaService.update(id, body);
      return HttpResponse(c).ok(data, undefined, 'Alokasi kuota magang berhasil diperbarui');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /internship-quotas/:id
  public async remove(c: AppContext) {
    try {
      const { id } = c.params;
      await QuotaService.remove(id);
      return HttpResponse(c).ok(undefined, undefined, 'Alokasi kuota magang berhasil dihapus');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new QuotaController();

import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import receptionistService from '@/services/receptionist.service';
import type {
  CreateReceptionistBody,
  ReceptionistQuery,
  UpdateReceptionistBody,
} from '@/types/receptionist.types';

class ReceptionistController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as ReceptionistQuery;
      const result = await receptionistService.list(query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  public async detail(c: AppContext) {
    try {
      const data = await receptionistService.getById(c.params.receptionistId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  public async createAccount(c: AppContext) {
    try {
      const body = c.body as unknown as CreateReceptionistBody;
      const data = await receptionistService.createAccount(c.user!.id, body);
      return HttpResponse(c).created(data, 'Akun resepsionis berhasil dibuat.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  public async updateAccount(c: AppContext) {
    try {
      const body = c.body as unknown as UpdateReceptionistBody;
      const data = await receptionistService.updateAccount(
        c.user!.id,
        c.params.receptionistId,
        body,
      );
      return HttpResponse(c).ok(data, undefined, 'Akun resepsionis berhasil diperbarui.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  public async deleteAccount(c: AppContext) {
    try {
      await receptionistService.deleteAccount(c.user!.id, c.params.receptionistId);
      return HttpResponse(c).ok(null, undefined, 'Akun resepsionis berhasil dihapus.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new ReceptionistController();

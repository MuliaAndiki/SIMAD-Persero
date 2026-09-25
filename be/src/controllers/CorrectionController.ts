import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import CorrectionService from '@/services/correction.service';
import type {
  ApproveCorrectionBody,
  CorrectionQuery,
  CreateCorrectionBody,
  RejectCorrectionBody,
} from '@/types/correction.types';

class CorrectionController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // POST /attendance/corrections (Intern submits correction)
  public async create(c: AppContext) {
    try {
      const userId = c.user!.id;
      const body = c.body as CreateCorrectionBody;
      const data = await CorrectionService.create(userId, body);
      return HttpResponse(c).created(data, 'Pengajuan koreksi absensi berhasil dikirim');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/corrections/me (Intern lists own corrections)
  public async getMyCorrections(c: AppContext) {
    try {
      const userId = c.user!.id;
      const query = c.query as unknown as CorrectionQuery;
      const result = await CorrectionService.getMyCorrections(userId, query);
      return HttpResponse(c).ok(result.data, result.meta, 'Riwayat pengajuan koreksi berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /attendance/corrections/:id (Detail of correction)
  public async getDetail(c: AppContext) {
    try {
      const { id } = c.params;
      const userId = c.user!.id;
      const roles = c.user!.roles || [];
      const data = await CorrectionService.getById(id, userId, roles);
      return HttpResponse(c).ok(data, undefined, 'Detail pengajuan koreksi berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /attendance/corrections/:id/cancel (Intern cancels correction)
  public async cancel(c: AppContext) {
    try {
      const { id } = c.params;
      const userId = c.user!.id;
      const data = await CorrectionService.cancel(id, userId);
      return HttpResponse(c).ok(data, undefined, 'Pengajuan koreksi berhasil dibatalkan');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /supervisor/attendance-corrections (Supervisor lists pending/reviewed corrections)
  public async listForSupervisor(c: AppContext) {
    try {
      const supervisorId = c.user!.id;
      const query = c.query as unknown as CorrectionQuery;
      const result = await CorrectionService.listForSupervisor(supervisorId, query);
      return HttpResponse(c).ok(result.data, result.meta, 'Daftar pengajuan koreksi absensi berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /supervisor/attendance-corrections/:id/approve (Supervisor approves)
  public async approve(c: AppContext) {
    try {
      const { id } = c.params;
      const supervisorId = c.user!.id;
      const body = c.body as ApproveCorrectionBody;
      const data = await CorrectionService.approve(id, supervisorId, body);
      return HttpResponse(c).ok(data, undefined, 'Pengajuan koreksi absensi berhasil disetujui');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /supervisor/attendance-corrections/:id/reject (Supervisor rejects)
  public async reject(c: AppContext) {
    try {
      const { id } = c.params;
      const supervisorId = c.user!.id;
      const body = c.body as RejectCorrectionBody;
      const data = await CorrectionService.reject(id, supervisorId, body);
      return HttpResponse(c).ok(data, undefined, 'Pengajuan koreksi absensi berhasil ditolak');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new CorrectionController();

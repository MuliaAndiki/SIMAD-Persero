import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import EvaluationService from '@/services/evaluation.service';
import type { EvaluationQuery, SaveEvaluationBody } from '@/types/evaluation.types';

class EvaluationController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /supervisor/internships/:id/evaluation
  public async getEvaluation(c: AppContext) {
    try {
      const { id } = c.params;
      const userId = c.user?.id;
      const roles = c.user?.roles || [];
      const data = await EvaluationService.getByInternshipId(id, userId, roles);
      return HttpResponse(c).ok(data, undefined, 'Data penilaian magang berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /supervisor/internships/:id/evaluation (Save draft)
  public async saveDraft(c: AppContext) {
    try {
      const { id } = c.params;
      const supervisorId = c.user!.id;
      const body = c.body as SaveEvaluationBody;
      const data = await EvaluationService.saveDraft(id, supervisorId, body);
      return HttpResponse(c).ok(data, undefined, 'Draf penilaian magang berhasil disimpan');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /supervisor/internships/:id/evaluation (Update draft)
  public async updateDraft(c: AppContext) {
    try {
      const { id } = c.params;
      const supervisorId = c.user!.id;
      const body = c.body as SaveEvaluationBody;
      const data = await EvaluationService.saveDraft(id, supervisorId, body);
      return HttpResponse(c).ok(data, undefined, 'Draf penilaian magang berhasil diperbarui');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /supervisor/internships/:id/evaluation/submit (Finalize evaluation)
  public async submit(c: AppContext) {
    try {
      const { id } = c.params;
      const supervisorId = c.user!.id;
      const body = c.body as SaveEvaluationBody;
      const data = await EvaluationService.submit(id, supervisorId, body);
      return HttpResponse(c).ok(data, undefined, 'Penilaian magang berhasil difinalisasi');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /hr-admin/evaluations (HR Admin list all evaluations)
  public async listAll(c: AppContext) {
    try {
      const query = c.query as unknown as EvaluationQuery;
      const result = await EvaluationService.listAll(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Daftar penilaian magang berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new EvaluationController();

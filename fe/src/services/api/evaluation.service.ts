import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { EVALUATION_ENDPOINTS } from '@/configs/endpoints/evaluation.endpoints';
import type {
  EvaluationItem,
  EvaluationQuery,
  SaveEvaluationBody,
} from '@/types/api/evaluation.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class EvaluationService {
  /**
   * GET /supervisor/internships/:internshipId/evaluation
   */
  public async GetByInternship(internshipId: string): Promise<TResponse<EvaluationItem>> {
    const res = await client.GetResponse<EvaluationItem>(
      EVALUATION_ENDPOINTS.GET_BY_INTERNSHIP(internshipId),
    );
    return toServiceResponse(res, {
      message: 'Data penilaian magang berhasil dimuat',
    });
  }

  /**
   * POST /supervisor/internships/:internshipId/evaluation (Save draft)
   */
  public async SaveDraft(
    internshipId: string,
    body: SaveEvaluationBody,
  ): Promise<TResponse<EvaluationItem>> {
    const res = await client.PostResponse<EvaluationItem>(
      EVALUATION_ENDPOINTS.SAVE_DRAFT(internshipId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Draf penilaian magang berhasil disimpan',
    });
  }

  /**
   * PATCH /supervisor/internships/:internshipId/evaluation (Update draft)
   */
  public async UpdateDraft(
    internshipId: string,
    body: SaveEvaluationBody,
  ): Promise<TResponse<EvaluationItem>> {
    const res = await client.PatchResponse<EvaluationItem>(
      EVALUATION_ENDPOINTS.UPDATE_DRAFT(internshipId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Draf penilaian magang berhasil diperbarui',
    });
  }

  /**
   * POST /supervisor/internships/:internshipId/evaluation/submit (Submit final)
   */
  public async SubmitFinal(
    internshipId: string,
    body: SaveEvaluationBody,
  ): Promise<TResponse<EvaluationItem>> {
    const res = await client.PostResponse<EvaluationItem>(
      EVALUATION_ENDPOINTS.SUBMIT_FINAL(internshipId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Penilaian magang berhasil difinalisasi',
    });
  }

  /**
   * GET /hr-admin/evaluations
   */
  public async HrList(query?: EvaluationQuery): Promise<TResponse<EvaluationItem[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<EvaluationItem[]>(`${EVALUATION_ENDPOINTS.HR_LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar penilaian magang berhasil dimuat',
    });
  }
}

export default new EvaluationService();

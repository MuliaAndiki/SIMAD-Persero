import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { GUIDE_ENDPOINTS } from '@/configs/endpoints/guide.endpoints';
import type {
  CreateGuideBody,
  GuideItem,
  GuideQuery,
  UpdateGuideBody,
} from '@/types/api/guide.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class GuideService {
  /**
   * GET /guides
   */
  public async List(query?: GuideQuery): Promise<TResponse<GuideItem[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<GuideItem[]>(`${GUIDE_ENDPOINTS.LIST}${qs}`);
    return toServiceResponse(res, {
      message: 'Daftar panduan berhasil dimuat',
    });
  }

  /**
   * GET /guides/:slug
   */
  public async Detail(slug: string): Promise<TResponse<GuideItem>> {
    const res = await client.GetResponse<GuideItem>(GUIDE_ENDPOINTS.DETAIL(slug));
    return toServiceResponse(res, {
      message: 'Detail panduan berhasil dimuat',
    });
  }

  /**
   * POST /guides
   */
  public async Create(body: CreateGuideBody): Promise<TResponse<GuideItem>> {
    const res = await client.PostResponse<GuideItem>(GUIDE_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Panduan berhasil dibuat',
      statusCode: 201,
    });
  }

  /**
   * PATCH /guides/:id
   */
  public async Update(id: string, body: UpdateGuideBody): Promise<TResponse<GuideItem>> {
    const res = await client.PatchResponse<GuideItem>(GUIDE_ENDPOINTS.UPDATE(id), body);
    return toServiceResponse(res, {
      message: 'Panduan berhasil diperbarui',
    });
  }

  /**
   * DELETE /guides/:id
   */
  public async Delete(id: string): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(GUIDE_ENDPOINTS.DELETE(id));
    return toServiceResponse(res, {
      message: 'Panduan berhasil dihapus',
    });
  }
}

export default new GuideService();

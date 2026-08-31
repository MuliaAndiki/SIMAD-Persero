import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { RECEPTIONIST_ENDPOINTS } from '@/configs/endpoints/receptionist.endpoints';
import type { IUser } from '@/types/api/model.type';
import type {
  CreateReceptionistBody,
  ReceptionistParams,
  ReceptionistQuery,
  ReceptionistResponse,
  UpdateReceptionistBody,
} from '@/types/api/receptionist.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class ReceptionistService {
  public async List(query?: ReceptionistQuery): Promise<TResponse<ReceptionistResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<ReceptionistResponse[]>(
      `${RECEPTIONIST_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar resepsionis berhasil dimuat',
    });
  }

  public async Detail(
    params: Pick<ReceptionistParams, 'receptionistId'>,
  ): Promise<TResponse<ReceptionistResponse>> {
    const res = await client.GetResponse<ReceptionistResponse>(
      RECEPTIONIST_ENDPOINTS.DETAIL(params.receptionistId),
    );
    return toServiceResponse(res, {
      message: 'Detail resepsionis berhasil dimuat',
    });
  }

  public async Create(body: CreateReceptionistBody): Promise<TResponse<IUser>> {
    const res = await client.PostResponse<IUser>(RECEPTIONIST_ENDPOINTS.CREATE, body);
    return toServiceResponse(res, {
      message: 'Akun resepsionis berhasil dibuat',
      statusCode: 201,
    });
  }

  public async Update(
    params: Pick<ReceptionistParams, 'receptionistId'>,
    body: UpdateReceptionistBody,
  ): Promise<TResponse<IUser>> {
    const res = await client.PatchResponse<IUser>(
      RECEPTIONIST_ENDPOINTS.UPDATE(params.receptionistId),
      body,
    );
    return toServiceResponse(res, {
      message: 'Akun resepsionis berhasil diperbarui',
    });
  }

  public async Delete(params: Pick<ReceptionistParams, 'receptionistId'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(
      RECEPTIONIST_ENDPOINTS.DELETE(params.receptionistId),
    );
    return toServiceResponse(res, {
      message: 'Akun resepsionis berhasil dihapus',
    });
  }
}

export default new ReceptionistService();

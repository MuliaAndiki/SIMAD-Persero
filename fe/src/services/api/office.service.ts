import { Api } from "@/api/api-entry";
import type { TResponse } from "@/api/types/response.types";
import { OFFICE_ENDPOINTS } from "@/configs/endpoints/office.endpoints";
import type {
  CreateOfficeBody,
  OfficeParams,
  OfficeQuery,
  OfficeResponse,
  UpdateOfficeBody,
} from "@/types/api/office.types";
import { buildQueryString } from "@/utils/query-string";
import { toServiceResponse } from "@/utils/service-response";

/**
 * Service modul Office — 5 method, satu method per endpoint backend
 * (be/src/routes/officeRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class OfficeService {
  /**
   * GET /offices
   * Mengambil daftar lokasi kantor dengan pagination dan filter.
   */
  public async List(query?: OfficeQuery): Promise<TResponse<OfficeResponse[]>> {
    const qs = buildQueryString(
      query as Record<string, string | number | boolean>,
    );
    const res = await client.GetResponse<OfficeResponse[]>(
      `${OFFICE_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: "Daftar lokasi kantor berhasil dimuat",
    });
  }

  /**
   * GET /offices/:officeId
   * Mengambil detail satu lokasi kantor.
   */
  public async Detail(
    params: Pick<OfficeParams, "officeId">,
  ): Promise<TResponse<OfficeResponse>> {
    const res = await client.GetResponse<OfficeResponse>(
      OFFICE_ENDPOINTS.DETAIL(params.officeId),
    );
    return toServiceResponse(res, {
      message: "Detail lokasi kantor berhasil dimuat",
    });
  }

  /**
   * POST /offices
   * Membuat lokasi kantor baru.
   */
  public async Create(
    body: Pick<
      CreateOfficeBody,
      | "name"
      | "address"
      | "latitude"
      | "longitude"
      | "radiusMeter"
      | "departmentIds"
    >,
  ): Promise<TResponse<OfficeResponse>> {
    const res = await client.PostResponse<OfficeResponse>(
      OFFICE_ENDPOINTS.CREATE,
      body,
    );
    return toServiceResponse(res, {
      message: "Lokasi kantor berhasil dibuat",
      statusCode: 201,
    });
  }

  /**
   * PATCH /offices/:officeId
   * Memperbarui lokasi kantor.
   */
  public async Update(
    params: Pick<OfficeParams, "officeId">,
    body: UpdateOfficeBody,
  ): Promise<TResponse<OfficeResponse>> {
    const res = await client.PatchResponse<OfficeResponse>(
      OFFICE_ENDPOINTS.UPDATE(params.officeId),
      body,
    );
    return toServiceResponse(res, {
      message: "Lokasi kantor berhasil diperbarui",
    });
  }

  /**
   * DELETE /offices/:officeId
   * Menonaktifkan lokasi kantor (soft delete).
   */
  public async Delete(
    params: Pick<OfficeParams, "officeId">,
  ): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(
      OFFICE_ENDPOINTS.DELETE(params.officeId),
    );
    return toServiceResponse(res, {
      message: "Lokasi kantor berhasil dihapus",
    });
  }
}

export default new OfficeService();

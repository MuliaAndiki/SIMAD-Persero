import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { FILE_ENDPOINTS } from '@/configs/endpoints/file.endpoints';
import type { FileParams, FileResponse } from '@/types/api/file.types';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul File — 4 method, satu method per endpoint backend
 * (be/src/routes/fileRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class FileService {
  /**
   * POST /files/upload
   * Mengunggah file (FormData dengan field 'file').
   */
  public async Upload(formData: FormData): Promise<TResponse<FileResponse>> {
    const res = await client.PostFormDataResponse<FileResponse>(FILE_ENDPOINTS.UPLOAD, formData);
    return toServiceResponse(res, {
      message: 'File berhasil diunggah',
      statusCode: 201,
    });
  }

  /**
   * GET /files/:fileId
   * Mengambil metadata/detail file.
   */
  public async Detail(params: Pick<FileParams, 'fileId'>): Promise<TResponse<FileResponse>> {
    const res = await client.GetResponse<FileResponse>(FILE_ENDPOINTS.DETAIL(params.fileId));
    return toServiceResponse(res, { message: 'Detail file berhasil dimuat' });
  }

  /**
   * GET /files/:fileId/download
   * Mengunduh file (mengembalikan Response mentah / binary).
   */
  public async Download(params: Pick<FileParams, 'fileId'>): Promise<Response> {
    return client.DownloadResponse(FILE_ENDPOINTS.DOWNLOAD(params.fileId));
  }

  /**
   * DELETE /files/:fileId
   * Menghapus file.
   */
  public async Delete(params: Pick<FileParams, 'fileId'>): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(FILE_ENDPOINTS.DELETE(params.fileId));
    return toServiceResponse(res, { message: 'File berhasil dihapus' });
  }
}

export default new FileService();

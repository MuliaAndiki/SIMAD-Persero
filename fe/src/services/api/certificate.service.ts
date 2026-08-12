import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { CERTIFICATE_ENDPOINTS } from '@/configs/endpoints/certificate.endpoints';
import type {
  CertificateDetailResponse,
  CertificateParams,
  CertificateResponse,
  CertificateVerifyParams,
  GenerateCertificateBody,
} from '@/types/api/certificate.types';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Certificate — 6 method, satu method per endpoint backend
 * (be/src/routes/certificateRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class CertificateService {
  /**
   * GET /certificates/verify/:verificationCode
   * Verifikasi sertifikat secara publik (tanpa auth).
   */
  public async Verify(
    params: Pick<CertificateVerifyParams, 'verificationCode'>,
  ): Promise<TResponse<CertificateResponse>> {
    const res = await client.PublicGetResponse<CertificateResponse>(
      CERTIFICATE_ENDPOINTS.VERIFY(params.verificationCode),
    );
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil diverifikasi',
    });
  }

  /**
   * GET /certificates/me
   * Mengambil daftar sertifikat milik sendiri (INTERN).
   */
  public async My(): Promise<TResponse<CertificateResponse[]>> {
    const res = await client.GetResponse<CertificateResponse[]>(CERTIFICATE_ENDPOINTS.MY);
    return toServiceResponse(res, {
      message: 'Daftar sertifikat berhasil dimuat',
    });
  }

  /**
   * POST /certificates/generate
   * Men-generate sertifikat baru (HR_ADMIN).
   */
  public async Generate(
    body: Pick<GenerateCertificateBody, 'internshipId'>,
  ): Promise<TResponse<CertificateResponse>> {
    const res = await client.PostResponse<CertificateResponse>(
      CERTIFICATE_ENDPOINTS.GENERATE,
      body,
    );
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil di-generate',
      statusCode: 201,
    });
  }

  /**
   * GET /certificates/:certificateId/download
   * Mengunduh file sertifikat (mengembalikan Response mentah / binary).
   */
  public async Download(params: Pick<CertificateParams, 'certificateId'>): Promise<Response> {
    return client.DownloadResponse(CERTIFICATE_ENDPOINTS.DOWNLOAD(params.certificateId));
  }

  /**
   * GET /certificates/:certificateId
   * Mengambil detail sertifikat.
   */
  public async Detail(
    params: Pick<CertificateParams, 'certificateId'>,
  ): Promise<TResponse<CertificateDetailResponse>> {
    const res = await client.GetResponse<CertificateDetailResponse>(
      CERTIFICATE_ENDPOINTS.DETAIL(params.certificateId),
    );
    return toServiceResponse(res, {
      message: 'Detail sertifikat berhasil dimuat',
    });
  }

  /**
   * POST /certificates/:certificateId/regenerate
   * Me-regenerate sertifikat (HR_ADMIN).
   */
  public async Regenerate(
    params: Pick<CertificateParams, 'certificateId'>,
  ): Promise<TResponse<CertificateResponse>> {
    const res = await client.PostResponse<CertificateResponse>(
      CERTIFICATE_ENDPOINTS.REGENERATE(params.certificateId),
      {},
    );
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil di-regenerate',
    });
  }
}

export default new CertificateService();

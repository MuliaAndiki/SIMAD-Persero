import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { CERTIFICATE_ENDPOINTS } from '@/configs/endpoints/certificate.endpoints';
import type {
  CertificateDetailResponse,
  CertificateParams,
  CertificateQuery,
  CertificateResponse,
  CertificateSettingsResponse,
  CertificateVerifyParams,
  GenerateCertificateBody,
  OfficeCertificateSettingResponse,
  UpdateCertificateSettingsBody,
  UpsertOfficeCertificateSettingBody,
} from '@/types/api/certificate.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class CertificateService {
  /**
   * GET /certificates/verify/:verificationCode
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
   */
  public async My(): Promise<TResponse<CertificateDetailResponse>> {
    const res = await client.GetResponse<CertificateDetailResponse>(CERTIFICATE_ENDPOINTS.MY);
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil dimuat',
    });
  }

  /**
   * GET /certificates (HR_ADMIN)
   */
  public async List(query?: CertificateQuery): Promise<TResponse<CertificateResponse[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<CertificateResponse[]>(
      `${CERTIFICATE_ENDPOINTS.LIST}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar sertifikat berhasil dimuat',
    });
  }

  /**
   * GET /certificates/pending-approval (HR_ADMIN)
   */
  public async PendingApprovals(query?: CertificateQuery): Promise<TResponse<any[]>> {
    const qs = buildQueryString(query as Record<string, string | number | boolean>);
    const res = await client.GetResponse<any[]>(
      `${CERTIFICATE_ENDPOINTS.PENDING_APPROVAL}${qs}`,
    );
    return toServiceResponse(res, {
      message: 'Daftar sertifikat menunggu persetujuan berhasil dimuat',
    });
  }

  /**
   * PATCH /certificates/:id/approve (HR_ADMIN)
   */
  public async Approve(id: string): Promise<TResponse<CertificateResponse>> {
    const res = await client.PatchResponse<CertificateResponse>(
      CERTIFICATE_ENDPOINTS.APPROVE(id),
      {},
    );
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil disetujui dan diterbitkan',
    });
  }

  /**
   * PATCH /certificates/:id/reject (HR_ADMIN)
   */
  public async Reject(id: string, reason: string): Promise<TResponse<any>> {
    const res = await client.PatchResponse<any>(
      CERTIFICATE_ENDPOINTS.REJECT(id),
      { reason },
    );
    return toServiceResponse(res, {
      message: 'Penerbitan sertifikat telah ditolak',
    });
  }

  /**
   * POST /certificates/generate (HR_ADMIN)
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
   */
  public async Download(params: Pick<CertificateParams, 'certificateId'>): Promise<Response> {
    return client.DownloadResponse(CERTIFICATE_ENDPOINTS.DOWNLOAD(params.certificateId));
  }

  /**
   * GET /certificates/me/download
   */
  public async DownloadMy(): Promise<Response> {
    return client.DownloadResponse(CERTIFICATE_ENDPOINTS.DOWNLOAD_MY);
  }

  /**
   * POST /certificates/:certificateId/regenerate
   */
  public async Regenerate(
    params: Pick<CertificateParams, 'certificateId'>,
  ): Promise<TResponse<CertificateResponse>> {
    const res = await client.PostResponse<CertificateResponse>(
      `/certificates/${params.certificateId}/regenerate`,
      {},
    );
    return toServiceResponse(res, {
      message: 'Sertifikat berhasil di-generate ulang',
    });
  }

  /**
   * GET /certificates/settings
   */
  public async GetSettings(): Promise<TResponse<CertificateSettingsResponse>> {
    const res = await client.GetResponse<CertificateSettingsResponse>(
      CERTIFICATE_ENDPOINTS.SETTINGS,
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat berhasil dimuat',
    });
  }

  /**
   * PATCH /certificates/settings
   */
  public async SaveSettings(
    body: UpdateCertificateSettingsBody,
  ): Promise<TResponse<CertificateSettingsResponse>> {
    const res = await client.PatchResponse<CertificateSettingsResponse>(
      CERTIFICATE_ENDPOINTS.SETTINGS,
      body,
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat berhasil disimpan',
    });
  }

  /**
   * GET /certificates/:certificateId
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

  // ─── Multi-Office Certificate Settings ──────────────────────────────

  /**
   * GET /certificate-settings
   */
  public async ListOfficeSettings(): Promise<TResponse<OfficeCertificateSettingResponse[]>> {
    const res = await client.GetResponse<OfficeCertificateSettingResponse[]>(
      CERTIFICATE_ENDPOINTS.OFFICE_SETTINGS_LIST,
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat kantor berhasil dimuat',
    });
  }

  /**
   * GET /certificate-settings/:officeLocationId
   */
  public async GetOfficeSetting(
    officeLocationId: string,
  ): Promise<TResponse<OfficeCertificateSettingResponse>> {
    const res = await client.GetResponse<OfficeCertificateSettingResponse>(
      CERTIFICATE_ENDPOINTS.OFFICE_SETTING_DETAIL(officeLocationId),
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat kantor berhasil dimuat',
    });
  }

  /**
   * POST /certificate-settings
   */
  public async CreateOfficeSetting(
    body: UpsertOfficeCertificateSettingBody,
  ): Promise<TResponse<OfficeCertificateSettingResponse>> {
    const res = await client.PostResponse<OfficeCertificateSettingResponse>(
      CERTIFICATE_ENDPOINTS.OFFICE_SETTING_CREATE,
      body,
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat kantor berhasil disimpan',
      statusCode: 201,
    });
  }

  /**
   * PATCH /certificate-settings/:id
   */
  public async UpdateOfficeSetting(
    id: string,
    body: UpsertOfficeCertificateSettingBody,
  ): Promise<TResponse<OfficeCertificateSettingResponse>> {
    const res = await client.PatchResponse<OfficeCertificateSettingResponse>(
      CERTIFICATE_ENDPOINTS.OFFICE_SETTING_UPDATE(id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Pengaturan sertifikat kantor berhasil diperbarui',
    });
  }
}

export default new CertificateService();

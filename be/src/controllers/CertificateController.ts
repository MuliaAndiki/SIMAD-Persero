import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import certificateService from '@/services/certificate.service';
import type {
  CertificateQuery,
  GenerateCertificateBody,
  RejectCertificateBody,
  UpsertCertificateSettingBody,
} from '@/types/certificate.types';

class CertificateController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /certificates/me
  public async getMyCertificate(c: AppContext) {
    try {
      const data = await certificateService.getMyCertificate(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/pending-approval (HR Admin)
  public async getPendingApprovals(c: AppContext) {
    try {
      const query = c.query as unknown as CertificateQuery;
      const result = await certificateService.getPendingApprovals(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Daftar sertifikat menunggu persetujuan berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /certificates/:id/approve (HR Admin)
  public async approve(c: AppContext) {
    try {
      const { id } = c.params;
      const hrAdminId = c.user!.id;
      const data = await certificateService.approve(id, hrAdminId);
      return HttpResponse(c).ok(data, undefined, 'Sertifikat berhasil disetujui dan diterbitkan');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /certificates/:id/reject (HR Admin)
  public async reject(c: AppContext) {
    try {
      const { id } = c.params;
      const hrAdminId = c.user!.id;
      const body = c.body as RejectCertificateBody;
      const data = await certificateService.reject(id, hrAdminId, body.reason);
      return HttpResponse(c).ok(data, undefined, 'Penerbitan sertifikat telah ditolak');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as CertificateQuery;
      const result = await certificateService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Daftar sertifikat berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/:certificateId
  public async getById(c: AppContext) {
    try {
      const data = await certificateService.getById(
        c.params.certificateId || c.params.id,
        c.user!.id,
        c.user!.roles,
      );
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/:certificateId/download — stream PDF binary directly.
  public async download(c: AppContext) {
    try {
      const { pdfBuffer, certificateNumber } = await certificateService.getCertificatePdf(
        c.params.certificateId || c.params.id,
        c.user!,
      );
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${certificateNumber}.pdf"`,
        },
      });
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/me/download — intern streams their certificate directly
  public async downloadMine(c: AppContext) {
    try {
      const { pdfBuffer, certificateNumber } = await certificateService.downloadMyCertificate(
        c.user!.id,
        c.user!,
      );
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${certificateNumber}.pdf"`,
        },
      });
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /certificates/generate
  public async generate(c: AppContext) {
    try {
      const body = c.body as unknown as GenerateCertificateBody;
      const data = await certificateService.generate(c.user!.id, body);
      return HttpResponse(c).created(data, 'Sertifikat berhasil dibuat.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/verify/:verificationCode (public)
  public async verify(c: AppContext) {
    try {
      const data = await certificateService.verify(c.params.verificationCode);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // ─── Certificate Settings per Office ───────────────────────────────

  // GET /certificate-settings
  public async listOfficeSettings(c: AppContext) {
    try {
      const data = await certificateService.listOfficeSettings();
      return HttpResponse(c).ok(data, undefined, 'Pengaturan sertifikat kantor berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificate-settings/:officeLocationId
  public async getOfficeSetting(c: AppContext) {
    try {
      const { officeLocationId } = c.params;
      const data = await certificateService.getSettingForOffice(officeLocationId);
      return HttpResponse(c).ok(data, undefined, 'Pengaturan sertifikat kantor berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /certificate-settings & PATCH /certificate-settings/:id
  public async saveOfficeSetting(c: AppContext) {
    try {
      const body = c.body as UpsertCertificateSettingBody;
      const data = await certificateService.upsertOfficeSetting(body);
      return HttpResponse(c).ok(data, undefined, 'Pengaturan sertifikat kantor berhasil disimpan');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new CertificateController();

import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import certificateService from '@/services/certificate.service';
import type { GenerateCertificateBody } from '@/types/certificate.types';

/**
 * Thin controller modul Certificate.
 * Seluruh logika bisnis didelegasikan ke CertificateService.
 * Sumber aturan: docs/07-api-specification.md §17.
 */
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

  // GET /certificates/:certificateId
  public async getById(c: AppContext) {
    try {
      const data = await certificateService.getById(c.params.certificateId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /certificates/:certificateId/download
  public async download(c: AppContext) {
    try {
      const result = await certificateService.download(c.params.certificateId, c.user!);
      const fileName = result.certificate.certificateNumber
        ? `${result.certificate.certificateNumber}.pdf`
        : 'certificate.pdf';

      return new Response(result.buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': String(result.buffer.length),
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

  // POST /certificates/:certificateId/regenerate
  public async regenerate(c: AppContext) {
    try {
      const data = await certificateService.regenerate(c.user!.id, c.params.certificateId, c.user!);
      return HttpResponse(c).ok(data, undefined, 'Sertifikat berhasil diperbarui.');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new CertificateController();

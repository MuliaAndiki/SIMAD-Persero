import { randomBytes } from 'node:crypto';
import { AppError } from '@/http/error';
import FileService from '@/services/file.service';
import type { AuthUser } from '@/types/auth.types';
import type {
  CertificateDetailResponse,
  CertificateResponse,
  GenerateCertificateBody,
} from '@/types/certificate.types';
import { InternshipStatus } from '@/types/internship.types';
import { createAuditLog } from '@/utils/audit.util';
import { generateCertificatePdf } from '@/utils/pdf.util';
import prisma from '../../prisma/client';


/**
 * Service layer modul Certificate.
 * Menghasilkan sertifikat PDF secara otomatis untuk internship COMPLETED
 * (BR-CERT-001/003/004), nomor unik (BR-CERT-005), template aktif
 * (BR-CERT-007), verification token unik (BR-CERT-010/011), dan audit log
 * (BR-CERT-012). Sertifikat yang terbit tidak dapat dihapus (BR-CERT-009).
 * Sumber aturan: docs/07-api-specification.md §17, docs/04-business-rules.md §23.
 */
class CertificateService {
  private readonly certificateInclude = {
    internship: {
      include: {
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true } },
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            institution: { select: { id: true, name: true, shortName: true } },
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    },
    template: { select: { id: true, name: true, isDefault: true } },
    file: {
      select: {
        id: true,
        originalName: true,
        fileName: true,
        mimeType: true,
        size: true,
        url: true,
      },
    },
    generatedBy: { select: { id: true, fullName: true, email: true } },
  } as const;

  /** Format tanggal ke bahasa Indonesia (ASCII-safe). */
  private formatDate(date: Date | null): string {
    if (!date) return '-';
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private serialize(certificate: any): CertificateResponse {
    const intern = certificate.internship?.internProfile?.user ?? null;
    return {
      id: certificate.id,
      internshipId: certificate.internshipId,
      certificateNumber: certificate.certificateNumber,
      templateId: certificate.templateId,
      fileId: certificate.fileId,
      fileUrl: certificate.file?.url ?? null,
      generatedById: certificate.generatedById,
      generatedBy: certificate.generatedBy?.fullName ?? null,
      generatedAt: certificate.generatedAt,
      verificationToken: certificate.verificationToken,
      createdAt: certificate.createdAt,
      internship: certificate.internship
        ? {
            id: certificate.internship.id,
            status: certificate.internship.status,
            actualStartDate: certificate.internship.actualStartDate,
            actualEndDate: certificate.internship.actualEndDate,
            department: certificate.internship.department,
            intern: intern
              ? {
                  id: intern.id,
                  fullName: intern.fullName,
                  email: intern.email,
                  studentNumber: certificate.internship.internProfile?.studentNumber ?? null,
                }
              : null,
          }
        : null,
    };
  }

  private serializeDetail(certificate: any): CertificateDetailResponse {
    return {
      ...this.serialize(certificate),
      file: certificate.file,
      template: certificate.template,
    };
  }

  /** Cari sertifikat dengan include lengkap, atau lempar 404. */
  private async findById(id: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: this.certificateInclude,
    });
    if (!certificate) {
      throw new AppError(404, 'Certificate not found');
    }
    return certificate;
  }

  /**
   * Ambil template aktif (isDefault = true), fallback ke template pertama.
   * BR-CERT-007: sertifikat menggunakan template yang aktif.
   */
  private async getActiveTemplate() {
    const defaultTemplate = await prisma.certificateTemplate.findFirst({
      where: { isDefault: true },
      orderBy: { createdAt: 'asc' },
    });
    if (defaultTemplate) return defaultTemplate;

    return prisma.certificateTemplate.findFirst({
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Buat nomor sertifikat unik: PLN-MAGANG-YYYY-NNNNNN (BR-CERT-005). */
  private async generateCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PLN-MAGANG-${year}-`;
    const count = await prisma.certificate.count({
      where: { certificateNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  /** Upload file PDF sertifikat lewat FileService (otomatis ke R2). */
  private async createPdfFile(uploadedById: string, fileName: string, buffer: Buffer) {
    return FileService.upload(uploadedById, {
      originalName: fileName,
      mimeType: 'application/pdf',
      size: buffer.length,
      buffer,
    });
  }

  // ─── 17.1 Get My Certificate ──────────────────────────────────────

  public async getMyCertificate(userId: string) {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new AppError(422, 'Intern profile not found');
    }

    const internship = await prisma.internship.findFirst({
      where: {
        internProfileId: profile.id,
        status: {
          in: [
            InternshipStatus.COMPLETED,
            InternshipStatus.CERTIFICATE_GENERATED,
            InternshipStatus.ARCHIVED,
          ],
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: { certificate: { include: this.certificateInclude } },
    });

    if (!internship?.certificate) {
      return null;
    }
    return this.serializeDetail(internship.certificate);
  }

  // ─── 17.3 Certificate Detail ──────────────────────────────────────

  public async getById(id: string) {
    const certificate = await this.findById(id);
    return this.serializeDetail(certificate);
  }

  // ─── 17.2 Download Certificate ────────────────────────────────────

  public async download(id: string, user: AuthUser) {
    const certificate = await this.findById(id);

    // Intern hanya dapat mengunduh sertifikat miliknya sendiri.
    if (user.roles.some((r) => r.toLowerCase() === 'intern')) {
      const ownerId = certificate.internship?.internProfile?.user?.id ?? null;
      if (ownerId !== user.id) {
        throw new AppError(403, 'Access denied. You can only download your own certificate');
      }
    }

    if (!certificate.fileId) {
      throw new AppError(410, 'Certificate file is unavailable');
    }

    const downloaded = await FileService.download(certificate.fileId);
    return {
      certificate: this.serialize(certificate),
      url: downloaded.url,
    };
  }

  // ─── 17.4 Generate Certificate (HR_ADMIN) ────────────────────────

  public async generate(userId: string, input: GenerateCertificateBody) {
    const internship = await prisma.internship.findUnique({
      where: { id: input.internshipId },
      include: {
        internProfile: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            institution: { select: { id: true, name: true, shortName: true } },
          },
        },
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true } },
        certificate: true,
      },
    });

    if (!internship) {
      throw new AppError(404, 'Internship not found');
    }

    // BR-CERT-001/003: hanya internship COMPLETED yang dapat memperoleh sertifikat.
    if (internship.status !== InternshipStatus.COMPLETED) {
      throw new AppError(400, 'Certificate can only be generated for COMPLETED internships');
    }

    // BR-CERT-002: tanggal hari ini >= tanggal selesai magang.
    if (internship.actualEndDate && internship.actualEndDate.getTime() > Date.now()) {
      throw new AppError(400, 'Internship end date must be in the past');
    }

    // Belum memiliki sertifikat (schema: @@unique internshipId).
    if (internship.certificate) {
      throw new AppError(409, 'Certificate has already been generated for this internship');
    }

    const internName = internship.internProfile?.user?.fullName ?? '-';
    const studentNumber = internship.internProfile?.studentNumber ?? '-';
    const institutionName = internship.internProfile?.institution?.name ?? '-';
    const departmentName = internship.department?.name ?? '-';
    const cityName = internship.officeLocation?.name ?? 'Jakarta';

    const template = await this.getActiveTemplate();
    const certificateNumber = await this.generateCertificateNumber();
    const verificationToken = randomBytes(16).toString('hex');

    // BR-CERT-006: sertifikat dalam format PDF.
    const pdfBuffer = generateCertificatePdf({
      certificateNumber,
      internName,
      studentNumber,
      institutionName,
      departmentName,
      startDate: this.formatDate(internship.actualStartDate),
      endDate: this.formatDate(internship.actualEndDate),
      verificationToken,
      cityName,
    });

    const file = await this.createPdfFile(userId, `${certificateNumber}.pdf`, pdfBuffer);

    const result = await prisma.$transaction(async (tx) => {
      const certificate = await tx.certificate.create({
        data: {
          internshipId: internship.id,
          templateId: template?.id ?? null,
          certificateNumber,
          fileId: file.id,
          generatedById: userId,
          generatedAt: new Date(),
          verificationToken,
        },
      });

      // State machine §9: COMPLETED → CERTIFICATE_GENERATED.
      await tx.internship.update({
        where: { id: internship.id },
        data: { status: InternshipStatus.CERTIFICATE_GENERATED },
      });
      await tx.internshipStatusHistory.create({
        data: {
          internshipId: internship.id,
          oldStatus: internship.status,
          newStatus: InternshipStatus.CERTIFICATE_GENERATED,
          changedById: userId,
          notes: 'Certificate generated',
        },
      });

      // BR-CERT-012: generate sertifikat wajib masuk audit log.
      await createAuditLog(tx, {
        userId,
        module: 'CERTIFICATE',
        action: 'GENERATE',
        tableName: 'certificates',
        recordId: certificate.id,
        newData: {
          certificateNumber,
          internshipId: internship.id,
          templateId: template?.id ?? null,
        },
      });

      return certificate;
    });

    const saved = await this.findById(result.id);
    return this.serializeDetail(saved);
  }

  // ─── 17.5 Verify Certificate (Public) ────────────────────────────

  public async verify(verificationCode: string) {
    const certificate = await prisma.certificate.findFirst({
      where: { verificationToken: verificationCode },
      include: this.certificateInclude,
    });

    if (!certificate) {
      throw new AppError(404, 'Certificate not found');
    }

    const intern = certificate.internship?.internProfile?.user ?? null;
    return {
      valid: true,
      certificateNumber: certificate.certificateNumber,
      internName: intern?.fullName ?? null,
      department: certificate.internship?.department?.name ?? null,
      internshipStatus: certificate.internship?.status ?? null,
      generatedAt: certificate.generatedAt,
    };
  }

  // ─── 17.6 Regenerate Certificate (HR_ADMIN) ──────────────────────

  public async regenerate(userId: string, certificateId: string, user: AuthUser) {
    const certificate = await this.findById(certificateId);

    // Sertifikat lama tidak boleh dihapus (BR-CERT-008/009) —
    // regenerasi membuat file PDF baru dengan template terkini.
    const template = await this.getActiveTemplate();
    const internName = certificate.internship?.internProfile?.user?.fullName ?? '-';
    const studentNumber = certificate.internship?.internProfile?.studentNumber ?? '-';
    const institutionName = certificate.internship?.internProfile?.institution?.name ?? '-';
    const departmentName = certificate.internship?.department?.name ?? '-';
    const cityName = certificate.internship?.officeLocation?.name ?? 'Jakarta';

    const pdfBuffer = generateCertificatePdf({
      certificateNumber: certificate.certificateNumber ?? '-',
      internName,
      studentNumber,
      institutionName,
      departmentName,
      startDate: this.formatDate(certificate.internship?.actualStartDate ?? null),
      endDate: this.formatDate(certificate.internship?.actualEndDate ?? null),
      verificationToken: certificate.verificationToken ?? '-',
      cityName,
    });

    const file = await this.createPdfFile(
      userId,
      `${certificate.certificateNumber ?? 'certificate'}.pdf`,
      pdfBuffer,
    );

    const updated = await prisma.$transaction(async (tx) => {
      const oldFileId = certificate.fileId;

      const updatedCertificate = await tx.certificate.update({
        where: { id: certificateId },
        data: {
          templateId: template?.id ?? certificate.templateId,
          fileId: file.id,
          generatedById: userId,
          generatedAt: new Date(),
        },
      });

      await createAuditLog(tx, {
        userId,
        module: 'CERTIFICATE',
        action: 'REGENERATE',
        tableName: 'certificates',
        recordId: certificateId,
        ...(oldFileId ? { oldData: { fileId: oldFileId } } : {}),
        newData: { fileId: file.id, templateId: template?.id ?? null },
      });

      return updatedCertificate;
    });

    // File lama di-soft-delete (tidak dihapus permanen — BR-CERT-008).
    if (certificate.fileId && certificate.fileId !== file.id) {
      await FileService.remove(certificate.fileId, user).catch(() => {});
    }

    const saved = await this.findById(updated.id);
    return this.serializeDetail(saved);
  }
}

export default new CertificateService();

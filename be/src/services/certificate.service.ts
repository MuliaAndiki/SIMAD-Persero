import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { AppError, BadRequestError, NotFoundError } from '@/http/error';
import FileService from '@/services/file.service';
import notificationService from '@/services/notification.service';
import type { AuthUser } from '@/types/auth.types';
import {
  CertificateApprovalStatus,
  type CertificateDetailResponse,
  type CertificateQuery,
  type CertificateResponse,
  type GenerateCertificateBody,
  type UpsertCertificateSettingBody,
} from '@/types/certificate.types';
import { InternshipStatus } from '@/types/internship.types';
import { createAuditLog } from '@/utils/audit.util';
import { generateCertificatePdf } from '@/utils/pdf.util';
import prisma from '../../prisma/client';

export interface CertificateSettings {
  signerName: string;
  signerRole: string;
  signatureUrl?: string;
  templateUrl?: string;
}

const SETTINGS_FILE_PATH = path.resolve(__dirname, '../config/certificate-settings.json');

/**
 * Service layer modul Certificate.
 * Mendukung multi-kantor certificate settings dan approval flow multi-gate (v1.0.1).
 */
class CertificateService {
  private readonly certificateInclude = {
    internship: {
      include: {
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true, address: true } },
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            institution: { select: { id: true, name: true, shortName: true } },
            major: { select: { id: true, name: true } },
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        evaluation: {
          select: {
            id: true,
            finalScore: true,
            grade: true,
            status: true,
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
      approvalStatus: certificate.approvalStatus ?? CertificateApprovalStatus.GENERATED,
      approvedById: certificate.approvedById,
      approvedAt: certificate.approvedAt,
      rejectionReason: certificate.rejectionReason,
      evaluationId: certificate.evaluationId,
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
            officeLocation: certificate.internship.officeLocation,
            intern: intern
              ? {
                  id: intern.id,
                  fullName: intern.fullName,
                  email: intern.email,
                  studentNumber: certificate.internship.internProfile?.studentNumber ?? null,
                }
              : null,
            evaluation: certificate.internship.evaluation
              ? {
                  id: certificate.internship.evaluation.id,
                  finalScore: Number(certificate.internship.evaluation.finalScore),
                  grade: certificate.internship.evaluation.grade ?? '-',
                  status: certificate.internship.evaluation.status,
                }
              : null,
          }
        : null,
    };
  }

  private serializeDetail(certificate: any): CertificateDetailResponse {
    return {
      ...this.serialize(certificate),
      file: certificate.file
        ? {
            id: certificate.file.id,
            originalName: certificate.file.originalName,
            fileName: certificate.file.fileName,
            mimeType: certificate.file.mimeType,
            size:
              certificate.file.size !== null && certificate.file.size !== undefined
                ? Number(certificate.file.size)
                : null,
            url: certificate.file.url,
          }
        : null,
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
      throw new NotFoundError('Certificate not found');
    }
    return certificate;
  }

  /**
   * Ambil template aktif (isDefault = true), fallback ke template pertama.
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

  /**
   * Buat nomor sertifikat unik sesuai setting kantor atau default: SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}
   */
  private async generateCertificateNumber(officeLocationId?: string | null): Promise<string> {
    const year = new Date().getFullYear();
    let officeCode = 'PST';
    let format = 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}';

    if (officeLocationId) {
      const [office, setting] = await Promise.all([
        prisma.officeLocation.findUnique({ where: { id: officeLocationId } }),
        prisma.certificateSetting.findUnique({ where: { officeLocationId } }),
      ]);
      if (office?.name) {
        officeCode = office.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PST';
      }
      if (setting?.certificateNumberFormat) format = setting.certificateNumberFormat;
    }

    const count = (await prisma.certificate.count()) + 1;
    const numStr = String(count).padStart(4, '0');

    return format
      .replace('{OFFICE_CODE}', officeCode)
      .replace('{YEAR}', String(year))
      .replace('{NUM}', numStr);
  }

  /** Upload file PDF sertifikat lewat FileService. */
  private async createPdfFile(uploadedById: string, fileName: string, buffer: Buffer) {
    return FileService.upload(uploadedById, {
      originalName: fileName,
      mimeType: 'application/pdf',
      size: buffer.length,
      buffer,
    });
  }

  // ─── Multi-Office Certificate Settings ─────────────────────────────

  public async getSettingForOffice(officeLocationId?: string | null): Promise<{
    signerName: string;
    signerRole: string;
    signatureFile?: { url: string | null } | null;
    stampFile?: { url: string | null } | null;
    templateFile?: { url: string | null } | null;
    certificateNumberFormat: string;
  }> {
    if (officeLocationId) {
      const setting = (await prisma.certificateSetting.findUnique({
        where: { officeLocationId },
        include: {
          signatureFile: { select: { id: true, url: true, originalName: true } },
          stampFile: { select: { id: true, url: true, originalName: true } },
          templateFile: { select: { id: true, url: true, originalName: true } },
          officeLocation: { select: { id: true, name: true, address: true } },
        },
      })) as any;
      if (setting) {
        return {
          signerName: setting.signerName,
          signerRole: setting.signerRole,
          signatureFile: setting.signatureFile,
          stampFile: setting.stampFile,
          templateFile: setting.templateFile,
          certificateNumberFormat: setting.certificateNumberFormat || 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
        };
      }
    }

    const fileSettings = this.getSettings();
    return {
      signerName: fileSettings.signerName,
      signerRole: fileSettings.signerRole,
      signatureFile: fileSettings.signatureUrl ? { url: fileSettings.signatureUrl } : null,
      stampFile: null,
      templateFile: null,
      certificateNumberFormat: 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
    };
  }

  public getSettings(): CertificateSettings {
    try {
      if (fs.existsSync(SETTINGS_FILE_PATH)) {
        const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read certificate settings file:', err);
    }
    return {
      signerName: 'NURLANA',
      signerRole: 'Senior Manager Keuangan, Komunikasi & Umum',
      signatureUrl: '',
      templateUrl: '',
    };
  }

  public async listOfficeSettings() {
    return prisma.certificateSetting.findMany({
      include: {
        officeLocation: { select: { id: true, name: true, address: true } },
        signatureFile: { select: { id: true, url: true, originalName: true } },
        stampFile: { select: { id: true, url: true, originalName: true } },
        templateFile: { select: { id: true, url: true, originalName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async upsertOfficeSetting(body: UpsertCertificateSettingBody) {
    const {
      officeLocationId,
      signerName,
      signerRole,
      signatureFileId,
      stampFileId,
      templateFileId,
      certificateNumberFormat,
      isActive,
    } = body;

    return prisma.certificateSetting.upsert({
      where: { officeLocationId },
      update: {
        signerName: signerName.trim(),
        signerRole: signerRole.trim(),
        signatureFileId: signatureFileId || null,
        stampFileId: stampFileId || null,
        templateFileId: templateFileId || null,
        certificateNumberFormat: certificateNumberFormat || 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
        isActive: isActive ?? true,
      },
      create: {
        officeLocationId,
        signerName: signerName.trim(),
        signerRole: signerRole.trim(),
        signatureFileId: signatureFileId || null,
        stampFileId: stampFileId || null,
        templateFileId: templateFileId || null,
        certificateNumberFormat: certificateNumberFormat || 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
        isActive: isActive ?? true,
      },
      include: {
        officeLocation: true,
        signatureFile: true,
        stampFile: true,
      },
    });
  }

  // ─── Multi-Gate Approval Workflow ──────────────────────────────────

  /**
   * Mengambil daftar sertifikat yang menunggu persetujuan HR Admin.
   * Hanya peserta dengan status COMPLETED dan evaluasi FINAL.
   */
  public async getPendingApprovals(query: CertificateQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      status: InternshipStatus.COMPLETED,
      evaluation: {
        status: 'FINAL',
      },
    };

    if (query.officeLocationId) {
      where.officeLocationId = query.officeLocationId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.keyword) {
      const kw = query.keyword.trim();
      where.internProfile = {
        user: { fullName: { contains: kw, mode: 'insensitive' } },
      };
    }

    const [total, internships] = await Promise.all([
      prisma.internship.count({ where }),
      prisma.internship.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          department: { select: { id: true, code: true, name: true } },
          officeLocation: { select: { id: true, name: true, address: true } },
          internProfile: {
            select: {
              id: true,
              studentNumber: true,
              institution: { select: { id: true, name: true } },
              major: { select: { id: true, name: true } },
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
          evaluation: true,
          certificate: {
            include: {
              file: { select: { id: true, url: true, originalName: true } },
              approvedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: internships,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * HR Admin menyetujui penerbitan sertifikat (Status: APPROVED) dan otomatis membuat PDF.
   */
  public async approve(certificateIdOrInternshipId: string, hrAdminUserId: string) {
    let cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: certificateIdOrInternshipId }, { internshipId: certificateIdOrInternshipId }],
      },
      include: this.certificateInclude,
    });

    const internshipId = cert?.internshipId ?? certificateIdOrInternshipId;

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        evaluation: true,
        internProfile: { select: { userId: true } },
      },
    });

    if (!internship) throw new NotFoundError('Data magang tidak ditemukan');

    if (internship.status !== InternshipStatus.COMPLETED) {
      throw new BadRequestError('Sertifikat hanya dapat disetujui untuk magang yang telah berstatus COMPLETED');
    }

    if (!internship.evaluation || internship.evaluation.status !== 'FINAL') {
      throw new BadRequestError('Sertifikat memerlukan evaluasi supervisor yang bernilai FINAL sebelum disetujui');
    }

    // Generate certificate & set approval status APPROVED -> GENERATED
    const generated = await this.generate(hrAdminUserId, { internshipId }, true);

    if (internship.internProfile?.userId) {
      await notificationService.send(hrAdminUserId, {
        userIds: [internship.internProfile.userId],
        typeCode: 'CERTIFICATE_APPROVED',
        title: 'Sertifikat Disetujui & Diterbitkan',
        message: 'Sertifikat magang Anda telah disetujui oleh HR Admin dan siap diunduh.',
      }).catch(() => null);
    }

    return generated;
  }

  /**
   * HR Admin menolak penerbitan sertifikat.
   */
  public async reject(certificateIdOrInternshipId: string, hrAdminUserId: string, reason: string) {
    let cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: certificateIdOrInternshipId }, { internshipId: certificateIdOrInternshipId }],
      },
    });

    if (!cert) {
      cert = await prisma.certificate.create({
        data: {
          internshipId: certificateIdOrInternshipId,
          approvalStatus: CertificateApprovalStatus.REJECTED,
          approvedById: hrAdminUserId,
          approvedAt: new Date(),
          rejectionReason: reason.trim(),
        },
      });
    } else {
      cert = await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          approvalStatus: CertificateApprovalStatus.REJECTED,
          approvedById: hrAdminUserId,
          approvedAt: new Date(),
          rejectionReason: reason.trim(),
        },
      });
    }

    return cert;
  }

  // ─── Generate Certificate Engine ───────────────────────────────────

  public async generate(
    userId: string,
    body: GenerateCertificateBody,
    isDirectApproval = false,
  ): Promise<CertificateResponse> {
    const internship = (await prisma.internship.findUnique({
      where: { id: body.internshipId },
      include: {
        certificate: true,
        evaluation: true,
        department: { select: { id: true, code: true, name: true } },
        officeLocation: { select: { id: true, name: true, address: true } },
        internProfile: {
          select: {
            id: true,
            studentNumber: true,
            institution: { select: { id: true, name: true } },
            major: { select: { id: true, name: true } },
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    })) as any;

    if (!internship) {
      throw new NotFoundError('Internship not found');
    }

    if (internship.status !== InternshipStatus.COMPLETED) {
      throw new BadRequestError(
        `Sertifikat hanya dapat diterbitkan untuk status COMPLETED (Status saat ini: ${internship.status})`,
      );
    }

    if (!internship.evaluation || internship.evaluation.status !== 'FINAL') {
      throw new BadRequestError(
        'Sertifikat memerlukan evaluasi supervisor yang bernilai FINAL.',
      );
    }

    // Ambil setting sertifikat khusus kantor magang ini
    const officeSetting = await this.getSettingForOffice(internship.officeLocationId);
    const certificateNumber = await this.generateCertificateNumber(internship.officeLocationId);
    const verificationToken = randomBytes(32).toString('hex');
    const template = await this.getActiveTemplate();

    const internName = internship.internProfile?.user?.fullName ?? '-';
    const studentNumber = internship.internProfile?.studentNumber ?? '-';
    const institutionName = internship.internProfile?.institution?.name ?? '-';
    const departmentName = internship.department?.name ?? '-';
    const cityName = internship.officeLocation?.city || internship.officeLocation?.name || 'Jakarta';

    // Generate PDF menggunakan setting kantor terkait
    const pdfBuffer = generateCertificatePdf({
      certificateNumber,
      internName,
      studentNumber,
      institutionName,
      departmentName,
      startDate: this.formatDate(internship.actualStartDate ?? null),
      endDate: this.formatDate(internship.actualEndDate ?? null),
      verificationToken,
      cityName,
      signerName: officeSetting.signerName,
      signerRole: officeSetting.signerRole,
      signatureUrl: officeSetting.signatureFile?.url ?? undefined,
    });

    const fileName = `certificate-${certificateNumber.replace(/[\/\\]/g, '-')}.pdf`;
    const file = await this.createPdfFile(userId, fileName, pdfBuffer);

    // Simpan data sertifikat
    const certificate = await prisma.$transaction(async (tx) => {
      const created = await tx.certificate.upsert({
        where: { internshipId: internship.id },
        update: {
          certificateNumber,
          templateId: template?.id ?? null,
          fileId: file.id,
          generatedById: userId,
          generatedAt: new Date(),
          verificationToken,
          approvalStatus: CertificateApprovalStatus.GENERATED,
          evaluationId: internship.evaluation!.id,
          approvedById: isDirectApproval ? userId : undefined,
          approvedAt: isDirectApproval ? new Date() : undefined,
          rejectionReason: null,
        },
        create: {
          internshipId: internship.id,
          certificateNumber,
          templateId: template?.id ?? null,
          fileId: file.id,
          generatedById: userId,
          generatedAt: new Date(),
          verificationToken,
          approvalStatus: CertificateApprovalStatus.GENERATED,
          evaluationId: internship.evaluation!.id,
          approvedById: isDirectApproval ? userId : undefined,
          approvedAt: isDirectApproval ? new Date() : undefined,
        },
        include: this.certificateInclude,
      });

      return created;
    });

    return this.serialize(certificate);
  }

  /**
   * Menyesuaikan sertifikat jika terjadi perpanjangan magang.
   */
  public async syncCertificateEndDate(
    internshipId: string,
    newEndDate: Date,
    userId: string,
  ) {
    const cert = await prisma.certificate.findUnique({
      where: { internshipId },
    });
    if (!cert) return;

    return this.generate(userId, { internshipId }, true);
  }

  // ─── 17.1 Get My Certificate ──────────────────────────────────────

  public async getMyCertificate(userId: string) {
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundError('Intern profile not found');
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

    if (!internship || !internship.certificate) {
      return null;
    }

    return this.serializeDetail(internship.certificate);
  }

  // ─── Direct PDF Download (Buffer) ─────────────────────────────────

  public async getCertificatePdf(
    certificateId: string,
    user: AuthUser,
  ): Promise<{ pdfBuffer: Buffer; certificateNumber: string }> {
    const certificate = await this.findById(certificateId);

    if (user.roles.some((r) => r.toLowerCase() === 'intern')) {
      const ownerId = certificate.internship?.internProfile?.user?.id ?? null;
      if (ownerId !== user.id) {
        throw new AppError(403, 'Access denied. You can only download your own certificate');
      }
    }

    const officeSetting = await this.getSettingForOffice(certificate.internship?.officeLocation?.id);
    const internName = certificate.internship?.internProfile?.user?.fullName ?? '-';
    const studentNumber = certificate.internship?.internProfile?.studentNumber ?? '-';
    const institutionName = certificate.internship?.internProfile?.institution?.name ?? '-';
    const departmentName = certificate.internship?.department?.name ?? '-';
    const cityName = certificate.internship?.officeLocation?.address || certificate.internship?.officeLocation?.name || 'Jakarta';

    const pdfBuffer = generateCertificatePdf({
      certificateNumber: certificate.certificateNumber ?? 'certificate',
      internName,
      studentNumber,
      institutionName,
      departmentName,
      startDate: this.formatDate(certificate.internship?.actualStartDate ?? null),
      endDate: this.formatDate(certificate.internship?.actualEndDate ?? null),
      verificationToken: certificate.verificationToken ?? '-',
      cityName,
      signerName: officeSetting.signerName,
      signerRole: officeSetting.signerRole,
      signatureUrl: officeSetting.signatureFile?.url ?? undefined,
    });

    return {
      pdfBuffer,
      certificateNumber: certificate.certificateNumber ?? 'certificate',
    };
  }

  public async downloadMyCertificate(
    userId: string,
    user: AuthUser,
  ): Promise<{ pdfBuffer: Buffer; certificateNumber: string }> {
    const cert = await this.getMyCertificate(userId);
    if (!cert) {
      throw new NotFoundError('Certificate not found or internship is not yet completed');
    }
    return this.getCertificatePdf(cert.id, user);
  }

  // ─── 17.3 Certificate Detail ──────────────────────────────────────

  public async getById(id: string, userId?: string, roles?: string[]) {
    const certificate = await this.findById(id);

    if (
      roles &&
      !roles.some((r) => r.toLowerCase() === 'hr_admin') &&
      roles.some((r) => r.toLowerCase() === 'intern')
    ) {
      const ownerId = certificate.internship?.internProfile?.user?.id ?? null;
      if (ownerId !== userId) {
        throw new AppError(403, 'Access denied. You can only view your own certificate');
      }
    }

    return this.serializeDetail(certificate);
  }

  // ─── 17.2 Download Certificate ────────────────────────────────────

  public async download(id: string, user: AuthUser) {
    const certificate = await this.findById(id);

    if (user.roles.some((r) => r.toLowerCase() === 'intern')) {
      const ownerId = certificate.internship?.internProfile?.user?.id ?? null;
      if (ownerId !== user.id) {
        throw new AppError(403, 'Access denied. You can only download your own certificate');
      }
    }

    if (!certificate.file?.url) {
      throw new NotFoundError('Certificate file not found');
    }

    return {
      fileUrl: certificate.file.url,
      certificateNumber: certificate.certificateNumber,
    };
  }

  // ─── 17.4 List Certificates (HR Admin) ────────────────────────────

  public async list(query: CertificateQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.approvalStatus) where.approvalStatus = query.approvalStatus;
    if (query.officeLocationId) where.internship = { officeLocationId: query.officeLocationId };
    if (query.departmentId) {
      where.internship = { ...(where.internship || {}), departmentId: query.departmentId };
    }
    if (query.keyword) {
      const kw = query.keyword.trim();
      where.OR = [
        { certificateNumber: { contains: kw, mode: 'insensitive' } },
        {
          internship: {
            internProfile: {
              user: { fullName: { contains: kw, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.certificateInclude,
      }),
      prisma.certificate.count({ where }),
    ]);

    return {
      data: certificates.map((cert) => this.serialize(cert)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── 17.5 Verify Certificate ──────────────────────────────────────

  public async verify(verificationCode: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { verificationToken: verificationCode },
          { certificateNumber: verificationCode },
        ],
      },
      include: this.certificateInclude,
    });

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found or invalid verification token',
        certificate: null,
      };
    }

    const intern = certificate.internship?.internProfile?.user ?? null;
    const internProfile = certificate.internship?.internProfile ?? null;

    return {
      valid: true,
      message: 'Certificate is valid',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        recipientName: intern?.fullName ?? '-',
        studentNumber: internProfile?.studentNumber ?? '-',
        institutionName: internProfile?.institution?.name ?? '-',
        majorName: internProfile?.major?.name ?? '-',
        department: certificate.internship?.department?.name ?? '-',
        officeLocation: certificate.internship?.officeLocation?.name ?? '-',
        period: {
          startDate: certificate.internship?.actualStartDate,
          endDate: certificate.internship?.actualEndDate,
        },
        evaluation: certificate.internship?.evaluation
          ? {
              grade: certificate.internship.evaluation.grade,
              finalScore: Number(certificate.internship.evaluation.finalScore),
            }
          : null,
        issuedAt: certificate.generatedAt,
      },
    };
  }
}

export default new CertificateService();

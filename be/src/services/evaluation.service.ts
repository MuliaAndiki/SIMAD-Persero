import { BadRequestError, ForbiddenError, NotFoundError } from '@/http/error';
import {
  EvaluationStatus,
  type EvaluationQuery,
  type SaveEvaluationBody,
} from '@/types/evaluation.types';
import notificationService from '@/services/notification.service';
import prisma from '../../prisma/client';

class EvaluationService {
  /**
   * Menghitung nilai akhir rata-rata dan konversi huruf mutu (Grade).
   */
  public calculateScoreAndGrade(scores: {
    disciplineScore: number;
    responsibilityScore: number;
    teamworkScore: number;
    communicationScore: number;
    technicalScore: number;
    initiativeScore: number;
  }) {
    const {
      disciplineScore,
      responsibilityScore,
      teamworkScore,
      communicationScore,
      technicalScore,
      initiativeScore,
    } = scores;

    const total =
      Number(disciplineScore) +
      Number(responsibilityScore) +
      Number(teamworkScore) +
      Number(communicationScore) +
      Number(technicalScore) +
      Number(initiativeScore);

    const finalScore = Number((total / 6).toFixed(2));

    let grade = 'E';
    if (finalScore >= 85) {
      grade = 'A';
    } else if (finalScore >= 75) {
      grade = 'B';
    } else if (finalScore >= 60) {
      grade = 'C';
    } else if (finalScore >= 50) {
      grade = 'D';
    }

    return { finalScore, grade };
  }

  /**
   * Mengambil data penilaian berdasarkan ID Internship.
   */
  public async getByInternshipId(
    internshipId: string,
    userId?: string,
    roles: string[] = [],
  ) {
    const evaluation = await prisma.internshipEvaluation.findUnique({
      where: { internshipId },
      include: {
        supervisor: { select: { id: true, fullName: true, email: true } },
        internship: {
          include: {
            internProfile: {
              select: {
                id: true,
                studentNumber: true,
                user: { select: { id: true, fullName: true, email: true } },
                institution: { select: { id: true, name: true } },
                major: { select: { id: true, name: true } },
              },
            },
            department: { select: { id: true, name: true, code: true } },
            officeLocation: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!evaluation) {
      // Jika belum ada record evaluasi, cek apakah internship valid
      const internship = await prisma.internship.findUnique({
        where: { id: internshipId },
        include: {
          internProfile: {
            select: {
              id: true,
              studentNumber: true,
              user: { select: { id: true, fullName: true, email: true } },
              institution: { select: { id: true, name: true } },
              major: { select: { id: true, name: true } },
            },
          },
          department: { select: { id: true, name: true, code: true } },
          officeLocation: { select: { id: true, name: true } },
        },
      });

      if (!internship) throw new NotFoundError('Data magang tidak ditemukan');

      return {
        id: null,
        internshipId,
        disciplineScore: 0,
        responsibilityScore: 0,
        teamworkScore: 0,
        communicationScore: 0,
        technicalScore: 0,
        initiativeScore: 0,
        finalScore: 0,
        grade: null,
        comments: null,
        status: EvaluationStatus.DRAFT,
        internship,
      };
    }

    // Role INTERN hanya boleh melihat nilainya jika status FINAL
    if (roles.includes('INTERN')) {
      if (evaluation.internship.internProfile?.user?.id !== userId) {
        throw new ForbiddenError('Anda tidak memiliki akses ke penilaian magang ini');
      }
      if (evaluation.status !== EvaluationStatus.FINAL) {
        throw new ForbiddenError('Penilaian magang belum difinalisasi oleh Supervisor');
      }
    }

    return evaluation;
  }

  /**
   * Supervisor menyimpan / memperbarui draf nilai evaluasi magang.
   */
  public async saveDraft(
    internshipId: string,
    supervisorUserId: string,
    body: SaveEvaluationBody,
  ) {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        supervisorAssignments: {
          where: { isActive: true },
        },
      },
    });

    if (!internship) {
      throw new NotFoundError('Data magang tidak ditemukan');
    }

    const isAssigned = internship.supervisorAssignments.some(
      (sa) => sa.supervisorId === supervisorUserId,
    );

    if (!isAssigned) {
      throw new ForbiddenError('Anda bukan supervisor yang ditugaskan untuk peserta magang ini');
    }

    const { finalScore, grade } = this.calculateScoreAndGrade(body);

    const evaluation = await prisma.internshipEvaluation.upsert({
      where: { internshipId },
      update: {
        disciplineScore: body.disciplineScore,
        responsibilityScore: body.responsibilityScore,
        teamworkScore: body.teamworkScore,
        communicationScore: body.communicationScore,
        technicalScore: body.technicalScore,
        initiativeScore: body.initiativeScore,
        finalScore,
        grade,
        comments: body.comments?.trim() || null,
        status: EvaluationStatus.DRAFT,
      },
      create: {
        internshipId,
        supervisorId: supervisorUserId,
        disciplineScore: body.disciplineScore,
        responsibilityScore: body.responsibilityScore,
        teamworkScore: body.teamworkScore,
        communicationScore: body.communicationScore,
        technicalScore: body.technicalScore,
        initiativeScore: body.initiativeScore,
        finalScore,
        grade,
        comments: body.comments?.trim() || null,
        status: EvaluationStatus.DRAFT,
      },
    });

    return evaluation;
  }

  /**
   * Supervisor memfinalisasi / submit nilai magang (Status: FINAL).
   */
  public async submit(
    internshipId: string,
    supervisorUserId: string,
    body: SaveEvaluationBody,
  ) {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        internProfile: {
          select: {
            user: { select: { id: true, fullName: true } },
          },
        },
        supervisorAssignments: {
          where: { isActive: true },
        },
        certificate: true,
      },
    });

    if (!internship) {
      throw new NotFoundError('Data magang tidak ditemukan');
    }

    const isAssigned = internship.supervisorAssignments.some(
      (sa) => sa.supervisorId === supervisorUserId,
    );

    if (!isAssigned) {
      throw new ForbiddenError('Anda bukan supervisor yang ditugaskan untuk peserta magang ini');
    }

    const { finalScore, grade } = this.calculateScoreAndGrade(body);
    const now = new Date();

    const evaluation = await prisma.$transaction(async (tx) => {
      // 1. Simpan atau perbarui nilai dengan status FINAL
      const res = await tx.internshipEvaluation.upsert({
        where: { internshipId },
        update: {
          disciplineScore: body.disciplineScore,
          responsibilityScore: body.responsibilityScore,
          teamworkScore: body.teamworkScore,
          communicationScore: body.communicationScore,
          technicalScore: body.technicalScore,
          initiativeScore: body.initiativeScore,
          finalScore,
          grade,
          comments: body.comments?.trim() || null,
          status: EvaluationStatus.FINAL,
          submittedAt: now,
        },
        create: {
          internshipId,
          supervisorId: supervisorUserId,
          disciplineScore: body.disciplineScore,
          responsibilityScore: body.responsibilityScore,
          teamworkScore: body.teamworkScore,
          communicationScore: body.communicationScore,
          technicalScore: body.technicalScore,
          initiativeScore: body.initiativeScore,
          finalScore,
          grade,
          comments: body.comments?.trim() || null,
          status: EvaluationStatus.FINAL,
          submittedAt: now,
        },
      });

      // 2. Jika sertifikat sudah ada atau status magang COMPLETED, update status sertifikat ke WAITING_APPROVAL
      if (internship.certificate) {
        await tx.certificate.update({
          where: { id: internship.certificate.id },
          data: {
            evaluationId: res.id,
            approvalStatus: 'WAITING_APPROVAL',
          },
        });
      }

      return res;
    });

    // 3. Buat notifikasi untuk intern di luar transaction
    if (internship.internProfile?.user?.id) {
      await notificationService.send(supervisorUserId, {
        userIds: [internship.internProfile.user.id],
        typeCode: 'EVALUATION_SUBMITTED',
        title: 'Penilaian Magang Selesai',
        message: `Supervisor telah menyelesaikan penilaian magang Anda dengan predikat ${grade} (${finalScore}).`,
      }).catch(() => null);
    }

    return evaluation;
  }

  /**
   * HR Admin memantau seluruh nilai peserta magang.
   */
  public async listAll(query: EvaluationQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.supervisorId) {
      where.supervisorId = query.supervisorId;
    }

    if (query.departmentId) {
      where.internship = {
        ...(where.internship || {}),
        departmentId: query.departmentId,
      };
    }

    if (query.officeLocationId) {
      where.internship = {
        ...(where.internship || {}),
        officeLocationId: query.officeLocationId,
      };
    }

    if (query.keyword) {
      const kw = query.keyword.trim();
      where.internship = {
        ...(where.internship || {}),
        internProfile: {
          user: {
            fullName: { contains: kw, mode: 'insensitive' },
          },
        },
      };
    }

    const [total, items] = await Promise.all([
      prisma.internshipEvaluation.count({ where }),
      prisma.internshipEvaluation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          supervisor: { select: { id: true, fullName: true, email: true } },
          internship: {
            include: {
              internProfile: {
                select: {
                  id: true,
                  studentNumber: true,
                  user: { select: { id: true, fullName: true, email: true } },
                  institution: { select: { id: true, name: true } },
                  major: { select: { id: true, name: true } },
                },
              },
              department: { select: { id: true, name: true, code: true } },
              officeLocation: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new EvaluationService();

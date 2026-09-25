import { BadRequestError, ForbiddenError, NotFoundError } from '@/http/error';
import {
  AttendanceCorrectionStatus,
  AttendanceCorrectionType,
  type ApproveCorrectionBody,
  type CorrectionQuery,
  type CreateCorrectionBody,
  type RejectCorrectionBody,
} from '@/types/correction.types';
import { AttendanceLogAction, AttendanceStatus, CheckInStatus, CheckOutStatus } from '@/types/attendance.types';
import notificationService from '@/services/notification.service';
import prisma from '../../prisma/client';

class CorrectionService {
  /**
   * Peserta magang mengajukan permohonan koreksi absensi.
   */
  public async create(userId: string, body: CreateCorrectionBody) {
    const { attendanceId, correctionType, requestedCheckIn, requestedCheckOut, reason, evidenceFileId } = body;

    // 1. Verifikasi attendance & kepemilikan intern
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        internship: {
          include: {
            internProfile: true,
            supervisorAssignments: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundError('Data absensi tidak ditemukan');
    }

    if (!attendance.internship.internProfile || attendance.internship.internProfile.userId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk mengajukan koreksi pada absensi ini');
    }

    // 2. Pastikan tidak ada pengajuan koreksi PENDING untuk absensi ini
    const existingPending = await prisma.attendanceCorrectionRequest.findFirst({
      where: {
        attendanceId,
        status: AttendanceCorrectionStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestError('Sudah ada permohonan koreksi yang sedang diproses untuk tanggal absensi ini');
    }

    // 3. Ambil supervisor aktif
    const activeSupervisorAssignment = attendance.internship.supervisorAssignments[0];
    const supervisorId = activeSupervisorAssignment?.supervisorId ?? null;

    // 4. Verifikasi file bukti jika ada
    if (evidenceFileId) {
      const file = await prisma.file.findUnique({ where: { id: evidenceFileId } });
      if (!file) throw new NotFoundError('File bukti koreksi tidak ditemukan');
    }

    // 5. Simpan pengajuan koreksi
    const correction = await prisma.attendanceCorrectionRequest.create({
      data: {
        attendanceId,
        internshipId: attendance.internshipId,
        internId: userId,
        supervisorId,
        correctionType,
        requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : null,
        requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : null,
        reason: reason.trim(),
        evidenceFileId: evidenceFileId ?? null,
        status: AttendanceCorrectionStatus.PENDING,
      },
      include: {
        attendance: true,
        evidenceFile: { select: { id: true, originalName: true, url: true } },
      },
    });

    // Buat notifikasi untuk supervisor jika ada
    if (supervisorId) {
      await notificationService.send(userId, {
        userIds: [supervisorId],
        typeCode: 'ATTENDANCE_CORRECTION_SUBMITTED',
        title: 'Pengajuan Koreksi Absensi Baru',
        message: `Peserta magang telah mengajukan koreksi absensi untuk tanggal ${attendance.attendanceDate?.toISOString().slice(0, 10)}.`,
      }).catch(() => null);
    }

    return correction;
  }

  /**
   * Mengambil riwayat pengajuan koreksi milik intern yang sedang login.
   */
  public async getMyCorrections(userId: string, query: CorrectionQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = { internId: userId };
    if (query.status) where.status = query.status;
    if (query.correctionType) where.correctionType = query.correctionType;

    const [total, items] = await Promise.all([
      prisma.attendanceCorrectionRequest.count({ where }),
      prisma.attendanceCorrectionRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attendance: {
            select: {
              id: true,
              attendanceDate: true,
              checkInAt: true,
              checkOutAt: true,
              attendanceStatus: true,
              checkInStatus: true,
              checkOutStatus: true,
            },
          },
          evidenceFile: { select: { id: true, originalName: true, url: true } },
          supervisor: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true, email: true } },
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

  /**
   * Mengambil detail pengajuan koreksi berdasarkan ID.
   */
  public async getById(id: string, userId: string, roles: string[]) {
    const correction = await prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
      include: {
        attendance: {
          include: {
            attendanceLogs: { take: 5, orderBy: { createdAt: 'desc' } },
            attendanceOverrides: true,
          },
        },
        intern: { select: { id: true, fullName: true, email: true } },
        supervisor: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { id: true, fullName: true, email: true } },
        evidenceFile: { select: { id: true, originalName: true, mimeType: true, url: true } },
        internship: {
          select: {
            id: true,
            status: true,
            department: { select: { id: true, name: true } },
            officeLocation: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!correction) {
      throw new NotFoundError('Pengajuan koreksi tidak ditemukan');
    }

    // Role INTERN hanya boleh melihat miliknya sendiri
    if (roles.includes('INTERN') && correction.internId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke pengajuan koreksi ini');
    }

    return correction;
  }

  /**
   * Intern membatalkan pengajuan koreksi absensi jika status masih PENDING.
   */
  public async cancel(id: string, userId: string) {
    const correction = await prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });

    if (!correction) {
      throw new NotFoundError('Pengajuan koreksi tidak ditemukan');
    }

    if (correction.internId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki izin membatalkan pengajuan ini');
    }

    if (correction.status !== AttendanceCorrectionStatus.PENDING) {
      throw new BadRequestError('Hanya permohonan dengan status PENDING yang dapat dibatalkan');
    }

    return prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: { status: AttendanceCorrectionStatus.CANCELLED },
    });
  }

  /**
   * Daftar pengajuan koreksi untuk Supervisor.
   */
  public async listForSupervisor(supervisorUserId: string, query: CorrectionQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { supervisorId: supervisorUserId },
        {
          internship: {
            supervisorAssignments: {
              some: { supervisorId: supervisorUserId, isActive: true },
            },
          },
        },
      ],
    };

    if (query.status) where.status = query.status;
    if (query.correctionType) where.correctionType = query.correctionType;
    if (query.internshipId) where.internshipId = query.internshipId;

    const [total, items] = await Promise.all([
      prisma.attendanceCorrectionRequest.count({ where }),
      prisma.attendanceCorrectionRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          intern: { select: { id: true, fullName: true, email: true } },
          attendance: {
            select: {
              id: true,
              attendanceDate: true,
              checkInAt: true,
              checkOutAt: true,
              attendanceStatus: true,
              checkInStatus: true,
              checkOutStatus: true,
            },
          },
          evidenceFile: { select: { id: true, originalName: true, url: true } },
          internship: {
            select: {
              id: true,
              department: { select: { id: true, name: true } },
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

  /**
   * Supervisor menyetujui koreksi absensi.
   */
  public async approve(id: string, supervisorUserId: string, body: ApproveCorrectionBody) {
    const correction = await prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
      include: { attendance: true, internship: true },
    });

    if (!correction) {
      throw new NotFoundError('Pengajuan koreksi tidak ditemukan');
    }

    if (correction.status !== AttendanceCorrectionStatus.PENDING) {
      throw new BadRequestError('Hanya pengajuan dengan status PENDING yang dapat disetujui');
    }

    const res = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // 1. Update status permohonan koreksi
      const updatedCorrection = await tx.attendanceCorrectionRequest.update({
        where: { id },
        data: {
          status: AttendanceCorrectionStatus.APPROVED,
          reviewedById: supervisorUserId,
          reviewedAt: now,
          supervisorNotes: body.supervisorNotes?.trim() || null,
        },
      });

      // 2. Siapkan update data pada tabel attendances
      const att = correction.attendance;
      const prevStatus = att.attendanceStatus;

      const updateAttendanceData: any = {};

      let effectiveCheckIn = att.checkInAt;
      let effectiveCheckOut = att.checkOutAt;

      if (
        correction.correctionType === AttendanceCorrectionType.CHECK_IN ||
        correction.correctionType === AttendanceCorrectionType.BOTH ||
        correction.correctionType === AttendanceCorrectionType.INVALID_OVERRIDE
      ) {
        if (correction.requestedCheckIn) {
          updateAttendanceData.checkInAt = correction.requestedCheckIn;
          effectiveCheckIn = correction.requestedCheckIn;
        }
        updateAttendanceData.checkInStatus = CheckInStatus.PRESENT;
      }

      if (
        correction.correctionType === AttendanceCorrectionType.CHECK_OUT ||
        correction.correctionType === AttendanceCorrectionType.BOTH ||
        correction.correctionType === AttendanceCorrectionType.INVALID_OVERRIDE
      ) {
        if (correction.requestedCheckOut) {
          updateAttendanceData.checkOutAt = correction.requestedCheckOut;
          effectiveCheckOut = correction.requestedCheckOut;
        }
        updateAttendanceData.checkOutStatus = CheckOutStatus.COMPLETED;
      }

      // Hitung totalWorkMinutes jika ada checkIn dan checkOut
      if (effectiveCheckIn && effectiveCheckOut) {
        const diffMs = effectiveCheckOut.getTime() - effectiveCheckIn.getTime();
        updateAttendanceData.totalWorkMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
        updateAttendanceData.attendanceStatus = AttendanceStatus.COMPLETED;
      } else {
        updateAttendanceData.attendanceStatus = AttendanceStatus.PRESENT;
      }

      // 3. Update data attendance
      const updatedAttendance = await tx.attendance.update({
        where: { id: att.id },
        data: updateAttendanceData,
      });

      // 4. Catat AttendanceOverride
      await tx.attendanceOverride.create({
        data: {
          attendanceId: att.id,
          supervisorId: supervisorUserId,
          previousStatus: prevStatus,
          newStatus: updateAttendanceData.attendanceStatus,
          reason: `Disetujui melalui pengajuan koreksi: ${correction.reason}. ${body.supervisorNotes ? `(Catatan: ${body.supervisorNotes})` : ''}`,
        },
      });

      // 5. Catat AttendanceLog
      await tx.attendanceLog.create({
        data: {
          attendanceId: att.id,
          action: AttendanceLogAction.OVERRIDE,
          deviceName: 'Supervisor Web Approval',
          platform: 'Web',
          browser: 'System',
          fakeGpsDetected: false,
        },
      });

      return { correction: updatedCorrection, attendance: updatedAttendance };
    });

    // 6. Buat notifikasi untuk intern di luar tx
    await notificationService.send(supervisorUserId, {
      userIds: [correction.internId],
      typeCode: 'ATTENDANCE_CORRECTION_APPROVED',
      title: 'Pengajuan Koreksi Disetujui',
      message: `Permohonan koreksi absensi tanggal ${correction.attendance.attendanceDate?.toISOString().slice(0, 10)} telah disetujui oleh Supervisor.`,
    }).catch(() => null);

    return res;
  }

  /**
   * Supervisor menolak koreksi absensi.
   */
  public async reject(id: string, supervisorUserId: string, body: RejectCorrectionBody) {
    const correction = await prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
      include: { attendance: true },
    });

    if (!correction) {
      throw new NotFoundError('Pengajuan koreksi tidak ditemukan');
    }

    if (correction.status !== AttendanceCorrectionStatus.PENDING) {
      throw new BadRequestError('Hanya pengajuan dengan status PENDING yang dapat ditolak');
    }

    const updated = await prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: {
        status: AttendanceCorrectionStatus.REJECTED,
        reviewedById: supervisorUserId,
        reviewedAt: new Date(),
        supervisorNotes: body.supervisorNotes.trim(),
      },
    });

    // Notifikasi untuk intern
    await notificationService.send(supervisorUserId, {
      userIds: [correction.internId],
      typeCode: 'ATTENDANCE_CORRECTION_REJECTED',
      title: 'Pengajuan Koreksi Ditolak',
      message: `Permohonan koreksi absensi tanggal ${correction.attendance.attendanceDate?.toISOString().slice(0, 10)} ditolak: ${body.supervisorNotes}`,
    }).catch(() => null);

    return updated;
  }
}

export default new CorrectionService();

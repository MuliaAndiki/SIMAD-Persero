import { AppError } from '@/http/error';
import type {
  AttendanceExportQuery,
  AttendanceHistoryQuery,
  AttendanceQuery,
  CheckInBody,
  CheckOutBody,
  OverrideAttendanceBody,
} from '@/types/attendance.types';
import {
  AttendanceLogAction,
  AttendanceStatus,
  CheckInStatus,
  CheckOutStatus,
  OVERRIDE_ALLOWED_STATUSES,
  ViolationSeverity,
  ViolationType,
} from '@/types/attendance.types';
import { checkInsideGeofence } from '@/utils/geofence.util';
import type { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../prisma/client';

/**
 * Attendance service — 10 endpoints.
 * Implements BR-ATT-001 through BR-ATT-007, BR-CHECKIN-*, BR-CHECKOUT-*,
 * BR-GEO-*, BR-FGPS-*, BR-OVERRIDE-*, BR-VIOLATION-*.
 */
class AttendanceService {
  // ── helpers ──────────────────────────────────────────────────────────

  private decimalToNumber(v: Decimal | null | undefined): number | null {
    if (v == null) return null;
    return Number(v);
  }

  /**
   * Get the active internship for a user, ensuring BR-ATT-001:
   * status = ACTIVE, onboarding completed.
   */
  private async getActiveInternship(userId: string) {
    const internship = await prisma.internship.findFirst({
      where: {
        internProfile: { userId },
        status: 'ACTIVE',
        onboardingCompleted: true,
      },
      include: {
        officeLocation: true,
        department: true,
      },
    });
    if (!internship) {
      throw new AppError(
        400,
        'Tidak ada internship aktif. Pastikan status ACTIVE dan onboarding selesai.',
      );
    }
    return internship;
  }

  /**
   * Get today's start/end boundaries (Asia/Jakarta — UTC+7).
   */
  private getTodayRange(): { start: Date; end: Date; todayDate: Date } {
    const now = new Date();
    // Shift to UTC+7
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dateStr = utc7.toISOString().slice(0, 10); // YYYY-MM-DD
    const todayDate = new Date(`${dateStr}T00:00:00.000Z`);
    const start = new Date(`${dateStr}T00:00:00.000+07:00`);
    const end = new Date(`${dateStr}T23:59:59.999+07:00`);
    return { start, end, todayDate };
  }

  /**
   * Get attendance setting for an office location.
   */
  private async getAttendanceSetting(officeLocationId: string) {
    const setting = await prisma.attendanceSetting.findFirst({
      where: { officeLocationId },
    });
    return setting;
  }

  /**
   * Validate time window for check-in/check-out using AttendanceSetting.
   * Times in DB are stored as Time (1970-01-01Txx:xx:xx).
   */
  private validateTimeWindow(
    now: Date,
    windowStart: Date | null | undefined,
    windowEnd: Date | null | undefined,
    label: string,
  ) {
    if (!windowStart || !windowEnd) return; // no restriction configured

    // Extract HH:MM from current time in UTC+7
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentMinutes = utc7.getUTCHours() * 60 + utc7.getUTCMinutes();

    const startMinutes = windowStart.getUTCHours() * 60 + windowStart.getUTCMinutes();
    const endMinutes = windowEnd.getUTCHours() * 60 + windowEnd.getUTCMinutes();

    if (currentMinutes < startMinutes) {
      throw new AppError(
        400,
        `${label} belum dimulai. Waktu mulai: ${String(windowStart.getUTCHours()).padStart(2, '0')}:${String(windowStart.getUTCMinutes()).padStart(2, '0')} WIB.`,
      );
    }
    if (currentMinutes > endMinutes) {
      throw new AppError(
        400,
        `Waktu ${label} telah berakhir. Batas akhir: ${String(windowEnd.getUTCHours()).padStart(2, '0')}:${String(windowEnd.getUTCMinutes()).padStart(2, '0')} WIB.`,
      );
    }
  }

  /**
   * Determine check-in status based on late threshold.
   * BR-CHECKIN-003: if after lateAfter → LATE, else PRESENT.
   */
  private determineCheckInStatus(
    now: Date,
    lateAfter: Date | null | undefined,
    fakeGpsDetected: boolean,
  ): CheckInStatus {
    // BR-FGPS-003: fake GPS → PENDING_REVIEW
    if (fakeGpsDetected) return CheckInStatus.PENDING_REVIEW;

    if (!lateAfter) return CheckInStatus.PRESENT;

    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentMinutes = utc7.getUTCHours() * 60 + utc7.getUTCMinutes();
    const lateMinutes = lateAfter.getUTCHours() * 60 + lateAfter.getUTCMinutes();

    return currentMinutes > lateMinutes ? CheckInStatus.LATE : CheckInStatus.PRESENT;
  }

  /**
   * Determine check-out status.
   */
  private determineCheckOutStatus(fakeGpsDetected: boolean): CheckOutStatus {
    if (fakeGpsDetected) return CheckOutStatus.PENDING_REVIEW;
    return CheckOutStatus.COMPLETED;
  }

  /**
   * Derive overall attendance status from check-in + check-out statuses.
   */
  private deriveAttendanceStatus(
    checkInStatus: string | null,
    checkOutStatus: string | null,
  ): AttendanceStatus {
    if (
      checkInStatus === CheckInStatus.PENDING_REVIEW ||
      checkOutStatus === CheckOutStatus.PENDING_REVIEW
    ) {
      return AttendanceStatus.PENDING_REVIEW;
    }
    if (checkOutStatus === CheckOutStatus.COMPLETED) {
      return AttendanceStatus.COMPLETED;
    }
    if (checkInStatus === CheckInStatus.LATE) {
      return AttendanceStatus.LATE;
    }
    if (checkInStatus === CheckInStatus.PRESENT) {
      return AttendanceStatus.PRESENT;
    }
    return AttendanceStatus.PRESENT;
  }

  // ── 16.1 Check In ───────────────────────────────────────────────────

  public async checkIn(
    userId: string,
    body: CheckInBody,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const internship = await this.getActiveInternship(userId);
    const now = new Date();
    const { todayDate } = this.getTodayRange();

    // BR-ATT-002 / BR-CHECKIN-001: only one check-in per day
    const existing = await prisma.attendance.findUnique({
      where: {
        internshipId_attendanceDate: {
          internshipId: internship.id,
          attendanceDate: todayDate,
        },
      },
    });
    if (existing?.checkInAt) {
      throw new AppError(400, 'Anda sudah melakukan Check In hari ini.');
    }

    // Weekend check
    const dayOfWeek = todayDate.getDay(); // 0=Sun, 6=Sat
    const setting = await this.getAttendanceSetting(internship.officeLocationId ?? '');
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !setting?.allowWeekend) {
      throw new AppError(400, 'Absensi tidak diperbolehkan pada akhir pekan.');
    }

    // BR-CHECKIN-002/004/005: validate check-in time window
    this.validateTimeWindow(now, setting?.checkInStart, setting?.checkInEnd, 'Check In');

    // BR-GEO-001/002: geofence validation
    const office = internship.officeLocation;
    if (!office?.latitude || !office?.longitude || !office.radiusMeter) {
      throw new AppError(400, 'Lokasi kantor belum dikonfigurasi untuk geofence.');
    }

    const geo = checkInsideGeofence(
      body.latitude,
      body.longitude,
      Number(office.latitude),
      Number(office.longitude),
      office.radiusMeter,
    );

    // BR-GEO-005: outside geofence → reject
    if (!geo.inside) {
      // Record violation if attendance record exists
      if (existing) {
        await prisma.attendanceViolation.create({
          data: {
            attendanceId: existing.id,
            violationType: ViolationType.OUTSIDE_GEOFENCE,
            severity: ViolationSeverity.MEDIUM,
            description: `Jarak ${geo.distance}m dari kantor, radius ${office.radiusMeter}m.`,
          },
        });
      }
      throw new AppError(
        400,
        `Anda berada di luar area geofence. Jarak: ${geo.distance}m, Radius: ${office.radiusMeter}m.`,
      );
    }

    const fakeGps = body.fakeGpsDetected ?? false;
    const checkInStatus = this.determineCheckInStatus(now, setting?.lateAfter, fakeGps);
    const attendanceStatus = this.deriveAttendanceStatus(checkInStatus, null);

    // Create or update attendance record
    const attendance = await prisma.$transaction(async (tx) => {
      const att = existing
        ? await tx.attendance.update({
            where: { id: existing.id },
            data: {
              checkInAt: now,
              checkInStatus,
              attendanceStatus,
            },
          })
        : await tx.attendance.create({
            data: {
              internshipId: internship.id,
              attendanceDate: todayDate,
              checkInAt: now,
              checkInStatus,
              attendanceStatus,
            },
          });

      // BR-ATT-006/007: create attendance log
      await tx.attendanceLog.create({
        data: {
          attendanceId: att.id,
          action: AttendanceLogAction.CHECK_IN,
          latitude: body.latitude,
          longitude: body.longitude,
          accuracyMeter: body.accuracy,
          distanceMeter: geo.distance,
          insideGeofence: geo.inside,
          ipAddress: meta.ipAddress ?? null,
          userAgent: meta.userAgent ?? null,
          fakeGpsDetected: fakeGps,
        },
      });

      // BR-FGPS-003: fake GPS → violation record
      if (fakeGps) {
        await tx.attendanceViolation.create({
          data: {
            attendanceId: att.id,
            violationType: ViolationType.FAKE_GPS,
            severity: ViolationSeverity.HIGH,
            description: 'Terdeteksi indikasi Fake GPS saat Check In.',
          },
        });
      }

      // BR-CHECKIN-003: late → violation record
      if (checkInStatus === CheckInStatus.LATE) {
        await tx.attendanceViolation.create({
          data: {
            attendanceId: att.id,
            violationType: ViolationType.LATE_ATTENDANCE,
            severity: ViolationSeverity.LOW,
            description: 'Check In melebihi batas waktu yang ditentukan.',
          },
        });
      }

      return att;
    });

    return {
      attendanceId: attendance.id,
      checkInTime: attendance.checkInAt,
      status: attendance.checkInStatus,
      distance: geo.distance,
      insideGeofence: geo.inside,
    };
  }

  // ── 16.2 Check Out ──────────────────────────────────────────────────

  public async checkOut(
    userId: string,
    body: CheckOutBody,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const internship = await this.getActiveInternship(userId);
    const now = new Date();
    const { todayDate } = this.getTodayRange();

    // BR-ATT-003: must have checked in
    const attendance = await prisma.attendance.findUnique({
      where: {
        internshipId_attendanceDate: {
          internshipId: internship.id,
          attendanceDate: todayDate,
        },
      },
    });
    if (!attendance?.checkInAt) {
      throw new AppError(400, 'Anda belum melakukan Check In hari ini.');
    }

    // BR-ATT-002: only one check-out per day
    if (attendance.checkOutAt) {
      throw new AppError(400, 'Anda sudah melakukan Check Out hari ini.');
    }

    // BR-CHECKOUT-002/003: validate check-out time window
    const setting = await this.getAttendanceSetting(internship.officeLocationId ?? '');
    this.validateTimeWindow(now, setting?.checkOutStart, setting?.checkOutEnd, 'Check Out');

    // Geofence check for check-out
    const office = internship.officeLocation;
    let geo = { distance: 0, inside: true };
    if (office?.latitude && office?.longitude && office.radiusMeter) {
      geo = checkInsideGeofence(
        body.latitude,
        body.longitude,
        Number(office.latitude),
        Number(office.longitude),
        office.radiusMeter,
      );
    }

    // BR-CHECKOUT-005: calculate total work minutes
    const totalWorkMinutes = Math.round((now.getTime() - attendance.checkInAt.getTime()) / 60_000);

    const checkOutStatus = this.determineCheckOutStatus(false);
    const attendanceStatus = this.deriveAttendanceStatus(attendance.checkInStatus, checkOutStatus);

    const updated = await prisma.$transaction(async (tx) => {
      const att = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutAt: now,
          checkOutStatus,
          attendanceStatus,
          totalWorkMinutes,
        },
      });

      // BR-ATT-006: attendance log
      await tx.attendanceLog.create({
        data: {
          attendanceId: att.id,
          action: AttendanceLogAction.CHECK_OUT,
          latitude: body.latitude,
          longitude: body.longitude,
          accuracyMeter: body.accuracy,
          distanceMeter: geo.distance,
          insideGeofence: geo.inside,
          ipAddress: meta.ipAddress ?? null,
          userAgent: meta.userAgent ?? null,
          fakeGpsDetected: false,
        },
      });

      return att;
    });

    return {
      attendanceId: updated.id,
      checkOutTime: updated.checkOutAt,
      status: updated.attendanceStatus,
      totalWorkMinutes: updated.totalWorkMinutes,
    };
  }

  // ── 16.3 Get My Attendance ──────────────────────────────────────────

  public async getMyAttendance(userId: string, query: AttendanceQuery) {
    const internship = await prisma.internship.findFirst({
      where: { internProfile: { userId } },
      orderBy: { createdAt: 'desc' },
    });
    if (!internship) {
      throw new AppError(404, 'Internship tidak ditemukan.');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      internshipId: internship.id,
    };

    if (query.month || query.year) {
      const now = new Date();
      const year = query.year ?? now.getFullYear();
      const month = query.month ?? now.getMonth() + 1;
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const end = new Date(year, month, 0); // last day of month
      where.attendanceDate = { gte: start, lte: end };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          attendanceLogs: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { attendanceDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: data.map((a: (typeof data)[number]) => this.serializeAttendance(a)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── 16.4 Attendance Detail ──────────────────────────────────────────

  public async getById(id: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        attendanceLogs: { orderBy: { createdAt: 'asc' } },
        attendanceOverrides: {
          include: {
            supervisor: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attendanceViolations: { orderBy: { createdAt: 'desc' } },
        internship: {
          include: {
            internProfile: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            department: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!attendance) {
      throw new AppError(404, 'Data absensi tidak ditemukan.');
    }
    return this.serializeAttendanceDetail(attendance);
  }

  // ── 16.5 Get Today's Attendance ─────────────────────────────────────

  public async getToday(userId: string) {
    const internship = await prisma.internship.findFirst({
      where: { internProfile: { userId } },
      orderBy: { createdAt: 'desc' },
    });
    if (!internship) {
      throw new AppError(404, 'Internship tidak ditemukan.');
    }

    const { todayDate } = this.getTodayRange();

    const attendance = await prisma.attendance.findUnique({
      where: {
        internshipId_attendanceDate: {
          internshipId: internship.id,
          attendanceDate: todayDate,
        },
      },
      include: {
        attendanceLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!attendance) {
      return null;
    }
    return this.serializeAttendance(attendance);
  }

  // ── 16.6 Attendance Summary ─────────────────────────────────────────

  public async getSummary(userId: string, query: AttendanceQuery) {
    const internship = await prisma.internship.findFirst({
      where: { internProfile: { userId } },
      orderBy: { createdAt: 'desc' },
    });
    if (!internship) {
      throw new AppError(404, 'Internship tidak ditemukan.');
    }

    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1;
    const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const end = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        internshipId: internship.id,
        attendanceDate: { gte: start, lte: end },
      },
    });

    const summary = {
      total: attendances.length,
      present: 0,
      late: 0,
      completed: 0,
      absent: 0,
      invalid: 0,
      pendingReview: 0,
    };

    for (const a of attendances) {
      switch (a.attendanceStatus) {
        case AttendanceStatus.PRESENT:
          summary.present++;
          break;
        case AttendanceStatus.LATE:
          summary.late++;
          break;
        case AttendanceStatus.COMPLETED:
          summary.completed++;
          break;
        case AttendanceStatus.ABSENT:
          summary.absent++;
          break;
        case AttendanceStatus.INVALID:
          summary.invalid++;
          break;
        case AttendanceStatus.PENDING_REVIEW:
          summary.pendingReview++;
          break;
      }
    }

    return { month, year, ...summary };
  }

  // ── 16.7 Supervisor Attendance Dashboard ────────────────────────────

  public async getSupervisorDashboard(userId: string) {
    // Get active supervisor assignments
    const assignments = await prisma.supervisorAssignment.findMany({
      where: {
        supervisorId: userId,
        isActive: true,
      },
      include: {
        internship: {
          include: {
            internProfile: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    const { todayDate } = this.getTodayRange();

    const internshipIds = assignments
      .map((a: (typeof assignments)[number]) => a.internship?.id)
      .filter((id): id is string => Boolean(id));

    const todayAttendances = await prisma.attendance.findMany({
      where: {
        internshipId: { in: internshipIds },
        attendanceDate: todayDate,
      },
      include: {
        attendanceLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    const attendanceMap = new Map(
      todayAttendances.map((a: (typeof todayAttendances)[number]) => [a.internshipId, a]),
    );

    return assignments.map((assignment: (typeof assignments)[number]) => {
      const att = assignment.internship?.id ? attendanceMap.get(assignment.internship.id) : null;
      return {
        internship: {
          id: assignment.internship?.id,
          intern: assignment.internship?.internProfile?.user,
          department: assignment.internship?.department,
        },
        todayAttendance: att ? this.serializeAttendance(att) : null,
      };
    });
  }

  // ── 16.8 Override Attendance ─────────────────────────────────────────

  public async override(attendanceId: string, userId: string, body: OverrideAttendanceBody) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        internship: {
          include: {
            supervisorAssignments: {
              where: { isActive: true },
            },
          },
        },
      },
    });
    if (!attendance) {
      throw new AppError(404, 'Data absensi tidak ditemukan.');
    }

    // BR-OVERRIDE: supervisor can only override their own department's interns
    const isSupervisor =
      attendance.internship?.supervisorAssignments?.some(
        (sa: { supervisorId: string | null }) => sa.supervisorId === userId,
      ) ?? false;
    if (!isSupervisor) {
      throw new AppError(403, 'Anda hanya dapat override absensi peserta di departemen Anda.');
    }

    // BR-OVERRIDE-001: only PRESENT or INVALID
    if (!OVERRIDE_ALLOWED_STATUSES.includes(body.status as AttendanceStatus)) {
      throw new AppError(
        400,
        `Status override harus salah satu dari: ${OVERRIDE_ALLOWED_STATUSES.join(', ')}.`,
      );
    }

    // BR-OVERRIDE-002: reason required (validated via DTO)

    const updated = await prisma.$transaction(async (tx) => {
      // BR-OVERRIDE-004: preserve previous status in override record
      await tx.attendanceOverride.create({
        data: {
          attendanceId: attendance.id,
          supervisorId: userId,
          previousStatus: attendance.attendanceStatus,
          newStatus: body.status,
          reason: body.reason,
        },
      });

      const att = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          attendanceStatus: body.status,
        },
      });

      return att;
    });

    return {
      attendanceId: updated.id,
      previousStatus: attendance.attendanceStatus,
      newStatus: updated.attendanceStatus,
    };
  }

  // ── 16.9 Get Attendance History (admin) ─────────────────────────────

  public async getHistory(query: AttendanceHistoryQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.internshipId) {
      where.internshipId = query.internshipId;
    }
    if (query.status) {
      where.attendanceStatus = query.status;
    }
    if (query.month || query.year) {
      const now = new Date();
      const year = query.year ?? now.getFullYear();
      const month = query.month ?? now.getMonth() + 1;
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const end = new Date(year, month, 0);
      where.attendanceDate = { gte: start, lte: end };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          internship: {
            include: {
              internProfile: {
                include: {
                  user: {
                    select: { id: true, fullName: true, email: true },
                  },
                },
              },
              department: { select: { id: true, name: true } },
            },
          },
          attendanceLogs: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { attendanceDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: data.map((a: (typeof data)[number]) => this.serializeAttendanceWithIntern(a)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── 16.10 Export Attendance ──────────────────────────────────────────

  public async exportAttendance(query: AttendanceExportQuery) {
    const where: Record<string, unknown> = {};

    if (query.departmentId) {
      where.internship = { departmentId: query.departmentId };
    }
    if (query.month || query.year) {
      const now = new Date();
      const year = query.year ?? now.getFullYear();
      const month = query.month ?? now.getMonth() + 1;
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const end = new Date(year, month, 0);
      where.attendanceDate = { gte: start, lte: end };
    }

    const data = await prisma.attendance.findMany({
      where,
      include: {
        internship: {
          include: {
            internProfile: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
            department: { select: { name: true } },
            officeLocation: { select: { name: true } },
          },
        },
        attendanceLogs: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { attendanceDate: 'desc' },
    });

    // Return JSON format; xlsx generation is a future enhancement
    return data.map((a: (typeof data)[number]) => ({
      date: a.attendanceDate,
      intern: a.internship?.internProfile?.user?.fullName ?? '-',
      email: a.internship?.internProfile?.user?.email ?? '-',
      department: a.internship?.department?.name ?? '-',
      office: a.internship?.officeLocation?.name ?? '-',
      checkIn: a.checkInAt,
      checkOut: a.checkOutAt,
      checkInStatus: a.checkInStatus,
      checkOutStatus: a.checkOutStatus,
      status: a.attendanceStatus,
      totalWorkMinutes: a.totalWorkMinutes,
    }));
  }

  // ── Serializers ─────────────────────────────────────────────────────

  private serializeAttendance(a: any) {
    return {
      id: a.id,
      internshipId: a.internshipId,
      attendanceDate: a.attendanceDate,
      checkInAt: a.checkInAt,
      checkOutAt: a.checkOutAt,
      checkInStatus: a.checkInStatus,
      checkOutStatus: a.checkOutStatus,
      attendanceStatus: a.attendanceStatus,
      totalWorkMinutes: a.totalWorkMinutes,
      notes: a.notes,
      logs: a.attendanceLogs?.map((l: any) => ({
        id: l.id,
        action: l.action,
        latitude: this.decimalToNumber(l.latitude),
        longitude: this.decimalToNumber(l.longitude),
        accuracyMeter: this.decimalToNumber(l.accuracyMeter),
        distanceMeter: this.decimalToNumber(l.distanceMeter),
        insideGeofence: l.insideGeofence,
        fakeGpsDetected: l.fakeGpsDetected,
        createdAt: l.createdAt,
      })),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  private serializeAttendanceDetail(a: any) {
    return {
      ...this.serializeAttendance(a),
      intern: a.internship?.internProfile?.user ?? null,
      department: a.internship?.department ?? null,
      overrides: a.attendanceOverrides?.map((o: any) => ({
        id: o.id,
        previousStatus: o.previousStatus,
        newStatus: o.newStatus,
        reason: o.reason,
        supervisor: o.supervisor,
        createdAt: o.createdAt,
      })),
      violations: a.attendanceViolations?.map((v: any) => ({
        id: v.id,
        violationType: v.violationType,
        severity: v.severity,
        description: v.description,
        resolved: v.resolved,
        createdAt: v.createdAt,
      })),
    };
  }

  private serializeAttendanceWithIntern(a: any) {
    return {
      ...this.serializeAttendance(a),
      intern: a.internship?.internProfile?.user ?? null,
      department: a.internship?.department ?? null,
    };
  }
}

export default new AttendanceService();

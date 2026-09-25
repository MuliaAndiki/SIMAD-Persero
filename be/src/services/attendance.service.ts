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
  OVERRIDE_CHECK_IN_TIME_RANGE,
  OVERRIDE_CHECK_OUT_TIME_RANGE,
  OverrideType,
  ViolationSeverity,
  ViolationType,
} from '@/types/attendance.types';
import { checkInsideGeofence } from '@/utils/geofence.util';
import type { Decimal } from '@prisma/client/runtime/library';
import ExcelJS from 'exceljs';
import prisma from '../../prisma/client';
import calendarService from './calendar.service';

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

    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentMinutes = utc7.getUTCHours() * 60 + utc7.getUTCMinutes();
    // Default batas tepat waktu: 08:00 WIB (8 * 60 = 480 menit)
    const lateMinutes = lateAfter
      ? lateAfter.getUTCHours() * 60 + lateAfter.getUTCMinutes()
      : 8 * 60;

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

  /**
   * Validate override time (HH:mm) is within the allowed range for its type.
   */
  private validateOverrideTime(
    time: string,
    range: { start: string; end: string },
    label: string,
  ) {
    const match = /^([01]\d|2[0-3]):[0-5]\d$/.exec(time);
    if (!match) {
      throw new AppError(400, 'Format waktu tidak valid. Gunakan HH:mm.');
    }
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    const startMinutes = this.timeToMinutes(range.start);
    const endMinutes = this.timeToMinutes(range.end);
    if (minutes < startMinutes || minutes > endMinutes) {
      throw new AppError(
        400,
        `Waktu override ${label} harus antara ${range.start} dan ${range.end} WIB.`,
      );
    }
  }

  private timeToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Combine an attendance date (UTC midnight of the WIB date) with an
   * HH:mm time interpreted as WIB (UTC+7).
   */
  private combineDateTime(dateOnly: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(dateOnly.getTime());
    d.setUTCHours(h - 7, m, 0, 0);
    return d;
  }

  /**
   * Find the nearest office whose geofence contains the given coordinate.
   * Interns may check in at any office (BR-GEO): return the closest match,
   * or null if none.
   */
  private async findNearestOfficeWithinGeofence(latitude: number, longitude: number) {
    const offices = await prisma.officeLocation.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        radiusMeter: { not: null },
      },
    });

    let best: { office: (typeof offices)[number]; distance: number } | null = null;
    for (const office of offices) {
      const geo = checkInsideGeofence(
        latitude,
        longitude,
        Number(office.latitude),
        Number(office.longitude),
        office.radiusMeter ?? 0,
      );
      if (geo.inside && (best === null || geo.distance < best.distance)) {
        best = { office, distance: geo.distance };
      }
    }
    return best;
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

    // Check Non-Working Days (Weekend / Holiday)
    const dateStr = todayDate.toISOString().slice(0, 10);
    const dayStatus = await calendarService.getDayStatus(dateStr);
    if (dayStatus.status === 'WEEKEND') {
      throw new AppError(
        400,
        'Absensi tidak dapat dilakukan pada hari non-kerja.',
        'NON_WORKING_DAY',
      );
    }
    if (dayStatus.status === 'HOLIDAY') {
      throw new AppError(400, 'Absensi tidak dapat dilakukan pada hari libur.', 'HOLIDAY');
    }

    const setting = await this.getAttendanceSetting(internship.officeLocationId ?? '');
    // BR-CHECKIN-002/004/005: validate check-in time window (default 08:00 - 10:00 WIB)
    const defaultCheckInStart = new Date('1970-01-01T06:00:00.000Z');
    const defaultCheckInEnd = new Date('1970-01-01T10:00:00.000Z');
    this.validateTimeWindow(
      now,
      setting?.checkInStart ?? defaultCheckInStart,
      setting?.checkInEnd ?? defaultCheckInEnd,
      'Check In',
    );

    // BR-GEO-001/002: geofence validation — bisa absen di kantor mana pun
    // selama berada di dalam radius salah satu kantor.
    const matched = await this.findNearestOfficeWithinGeofence(
      body.latitude,
      body.longitude,
    );
    if (!matched) {
      // Record violation if attendance record exists
      if (existing) {
        await prisma.attendanceViolation.create({
          data: {
            attendanceId: existing.id,
            violationType: ViolationType.OUTSIDE_GEOFENCE,
            severity: ViolationSeverity.MEDIUM,
            description: 'Berada di luar radius geofence seluruh kantor.',
          },
        });
      }
      throw new AppError(
        400,
        'Anda berada di luar area geofence seluruh kantor.',
      );
    }
    const geo = { distance: matched.distance, inside: true };

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

    // Check Non-Working Days (Weekend / Holiday)
    const dateStr = todayDate.toISOString().slice(0, 10);
    const dayStatus = await calendarService.getDayStatus(dateStr);
    if (dayStatus.status === 'WEEKEND') {
      throw new AppError(
        400,
        'Absensi tidak dapat dilakukan pada hari non-kerja.',
        'NON_WORKING_DAY',
      );
    }
    if (dayStatus.status === 'HOLIDAY') {
      throw new AppError(400, 'Absensi tidak dapat dilakukan pada hari libur.', 'HOLIDAY');
    }

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

    // BR-CHECKOUT-002/003: validate check-out time window (default 17:00 - 20:00 WIB)
    const setting = await this.getAttendanceSetting(internship.officeLocationId ?? '');
    const defaultCheckOutStart = new Date('1970-01-01T17:00:00.000Z');
    const defaultCheckOutEnd = new Date('1970-01-01T20:00:00.000Z');
    this.validateTimeWindow(
      now,
      setting?.checkOutStart ?? defaultCheckOutStart,
      setting?.checkOutEnd ?? defaultCheckOutEnd,
      'Check Out',
    );

    // Geofence check for check-out — bisa absen di kantor mana pun.
    const matched = await this.findNearestOfficeWithinGeofence(
      body.latitude,
      body.longitude,
    );
    if (!matched) {
      await prisma.attendanceViolation.create({
        data: {
          attendanceId: attendance.id,
          violationType: ViolationType.OUTSIDE_GEOFENCE,
          severity: ViolationSeverity.MEDIUM,
          description: 'Berada di luar radius geofence seluruh kantor.',
        },
      });
      throw new AppError(
        400,
        'Anda berada di luar area geofence seluruh kantor.',
      );
    }
    const geo = { distance: matched.distance, inside: true };

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
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      where.attendanceDate = { gte: start, lte: end };
    }

    const [total, attendances] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        include: {
          attendanceLogs: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { attendanceDate: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: attendances.map((a) => this.serializeAttendance(a)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── 16.4 Attendance Detail ──────────────────────────────────────────

  public async getById(id: string, userId?: string) {
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
    // BR-ATT-OWN: INTERN hanya boleh melihat detail absensinya sendiri.
    if (userId && attendance.internship?.internProfile?.userId !== userId) {
      throw new AppError(403, 'Anda tidak memiliki akses ke data absensi ini.');
    }
    return this.serializeAttendanceDetail(attendance);
  }

  // ── 16.5 Get Today's Attendance ─────────────────────────────────────

  public async getToday(userId: string) {
    const internship = await prisma.internship.findFirst({
      where: { internProfile: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        officeLocation: {
          include: {
            attendanceSettings: true,
          },
        },
      },
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

    const office = internship.officeLocation
      ? {
          id: internship.officeLocation.id,
          name: internship.officeLocation.name,
          address: internship.officeLocation.address,
          latitude: this.decimalToNumber(internship.officeLocation.latitude),
          longitude: this.decimalToNumber(internship.officeLocation.longitude),
          radiusMeter: internship.officeLocation.radiusMeter ?? 100,
        }
      : null;

    const rawSetting = internship.officeLocation?.attendanceSettings?.[0] ?? null;
    const setting = rawSetting
      ? {
          checkInStart: rawSetting.checkInStart,
          checkInEnd: rawSetting.checkInEnd,
          checkOutStart: rawSetting.checkOutStart,
          checkOutEnd: rawSetting.checkOutEnd,
          lateAfter: rawSetting.lateAfter,
        }
      : {
          checkInStart: new Date('1970-01-01T08:00:00.000Z'),
          checkInEnd: new Date('1970-01-01T10:00:00.000Z'),
          checkOutStart: new Date('1970-01-01T17:00:00.000Z'),
          checkOutEnd: new Date('1970-01-01T20:00:00.000Z'),
          lateAfter: new Date('1970-01-01T08:30:00.000Z'),
        };

    const serializedAttendance = attendance ? this.serializeAttendance(attendance) : null;

    if (serializedAttendance) {
      return {
        ...serializedAttendance,
        office,
        setting,
      };
    }

    return {
      id: null,
      internshipId: internship.id,
      attendanceDate: todayDate,
      checkInAt: null,
      checkOutAt: null,
      checkInStatus: null,
      checkOutStatus: null,
      attendanceStatus: null,
      totalWorkMinutes: null,
      notes: null,
      logs: [],
      office,
      setting,
    };
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

    const where: Record<string, unknown> = {
      internshipId: internship.id,
    };

    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1;
    const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    where.attendanceDate = { gte: start, lte: end };

    const attendances = await prisma.attendance.findMany({
      where,
      select: { attendanceStatus: true },
    });

    const summary = {
      total: attendances.length,
      present: 0,
      late: 0,
      completed: 0,
      absent: 0,
      invalid: 0,
      pendingReview: 0,
      holiday: 0,
      weekend: 0,
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
        case 'HOLIDAY':
          summary.holiday++;
          break;
        case 'WEEKEND':
          summary.weekend++;
          break;
      }
    }

    return { month, year, ...summary };
  }

  // ── 16.7 Supervisor Attendance Dashboard ────────────────────────────

  public async getSupervisorDashboard(userId: string, dateStr?: string) {
    // Get active supervisor assignments
    const assignments = await prisma.supervisorAssignment.findMany({
      where: {
        supervisorId: userId,
        isActive: true,
      },
      include: {
        internship: {
          select: {
            id: true,
            status: true,
            actualStartDate: true,
            actualEndDate: true,
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

    let targetDate: Date;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.slice(0, 10))) {
      targetDate = new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
    } else {
      const { todayDate } = this.getTodayRange();
      targetDate = todayDate;
    }

    const internshipIds = assignments
      .map((a: (typeof assignments)[number]) => a.internship?.id)
      .filter((id): id is string => Boolean(id));

    const todayAttendances = await prisma.attendance.findMany({
      where: {
        internshipId: { in: internshipIds },
        attendanceDate: targetDate,
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
          status: assignment.internship?.status ?? null,
          startDate: assignment.internship?.actualStartDate?.toISOString() ?? null,
          endDate: assignment.internship?.actualEndDate?.toISOString() ?? null,
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

    // BR-OVERRIDE-001: pilih tipe override (CHECK_IN / CHECK_OUT / INVALID)
    const type = body.type as OverrideType;
    if (
      type !== OverrideType.CHECK_IN &&
      type !== OverrideType.CHECK_OUT &&
      type !== OverrideType.INVALID
    ) {
      throw new AppError(400, 'Tipe override harus CHECK_IN, CHECK_OUT, atau INVALID.');
    }

    // BR-OVERRIDE-002: reason required (validated via DTO)

    // INVALID: tandai absensi curang / dibatalkan (tanpa waktu).
    if (type === OverrideType.INVALID) {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.attendanceOverride.create({
          data: {
            attendanceId: attendance.id,
            supervisorId: userId,
            previousStatus: attendance.attendanceStatus,
            newStatus: AttendanceStatus.INVALID,
            reason: body.reason,
          },
        });
        return tx.attendance.update({
          where: { id: attendance.id },
          data: { attendanceStatus: AttendanceStatus.INVALID },
        });
      });

      return {
        attendanceId: updated.id,
        previousStatus: attendance.attendanceStatus,
        newStatus: updated.attendanceStatus,
      };
    }

    if (!body.time) {
      throw new AppError(
        400,
        `Waktu override ${type === OverrideType.CHECK_IN ? 'Check In' : 'Check Out'} wajib diisi.`,
      );
    }
    const range =
      type === OverrideType.CHECK_IN
        ? OVERRIDE_CHECK_IN_TIME_RANGE
        : OVERRIDE_CHECK_OUT_TIME_RANGE;
    const rangeLabel = type === OverrideType.CHECK_IN ? 'Check In' : 'Check Out';
    this.validateOverrideTime(body.time, range, rangeLabel);

    const ts = this.combineDateTime(attendance.attendanceDate, body.time);
    const checkInStatus =
      type === OverrideType.CHECK_IN
        ? CheckInStatus.PRESENT
        : (attendance.checkInStatus as CheckInStatus | null);
    const checkOutStatus =
      type === OverrideType.CHECK_OUT
        ? CheckOutStatus.COMPLETED
        : (attendance.checkOutStatus as CheckOutStatus | null);
    const attendanceStatus = this.deriveAttendanceStatus(checkInStatus, checkOutStatus);

    const updated = await prisma.$transaction(async (tx) => {
      // BR-OVERRIDE-004: preserve previous status in override record
      await tx.attendanceOverride.create({
        data: {
          attendanceId: attendance.id,
          supervisorId: userId,
          previousStatus: attendance.attendanceStatus,
          newStatus: attendanceStatus,
          reason: body.reason,
        },
      });

      const att = await tx.attendance.update({
        where: { id: attendance.id },
        data:
          type === OverrideType.CHECK_IN
            ? { checkInAt: ts, checkInStatus, attendanceStatus }
            : { checkOutAt: ts, checkOutStatus, attendanceStatus },
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

  public async getHistory(query: AttendanceHistoryQuery, user?: { id: string; roles?: string[] }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    const roles = (user?.roles ?? []).map((r) => r.toLowerCase());
    if (roles.includes('supervisor') && !roles.includes('hr_admin')) {
      const internshipWhere: Record<string, unknown> = {
        supervisorAssignments: {
          some: { supervisorId: user!.id, isActive: true },
        },
      };
      if (query.internshipId) {
        internshipWhere.id = query.internshipId;
      }
      where.internship = internshipWhere;
    } else if (query.internshipId) {
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

  public async exportAttendance(
    user: { id: string; roles?: string[] },
    query: AttendanceExportQuery,
  ) {
    const where: Record<string, unknown> = {};

    // Role-based filtering
    const roles = (user.roles ?? []).map((r) => r.toLowerCase());
    if (roles.includes('hr_admin')) {
      // HR_ADMIN can see all, apply optional filters
      const internshipWhere: Record<string, unknown> = {};
      if (query.internshipId) internshipWhere.id = query.internshipId;
      if (query.departmentId) internshipWhere.departmentId = query.departmentId;
      if (query.officeLocationId) internshipWhere.officeLocationId = query.officeLocationId;
      if (Object.keys(internshipWhere).length > 0) {
        where.internship = internshipWhere;
      }
    } else if (roles.includes('supervisor')) {
      // SUPERVISOR can see interns they supervise
      const internshipWhere: Record<string, unknown> = {
        supervisorAssignments: {
          some: { supervisorId: user.id, isActive: true },
        },
      };
      if (query.internshipId) {
        internshipWhere.id = query.internshipId;
      }
      if (query.departmentId) {
        internshipWhere.departmentId = query.departmentId;
      }
      where.internship = internshipWhere;
    } else if (roles.includes('intern')) {
      // INTERN can only see their own attendance
      where.internship = {
        internProfile: { userId: user.id },
      };
    } else {
      throw new AppError(403, 'Anda tidak memiliki akses ke fitur ini.');
    }

    if (query.month || query.year) {
      const now = new Date();
      const year = query.year ?? now.getFullYear();
      const month = query.month ?? now.getMonth() + 1;
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
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
      },
      orderBy: { attendanceDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance History');

    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Nama Intern', key: 'intern', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Departemen', key: 'department', width: 25 },
      { header: 'Kantor', key: 'office', width: 25 },
      { header: 'Check In', key: 'checkIn', width: 20 },
      { header: 'Check Out', key: 'checkOut', width: 20 },
      { header: 'Status Check In', key: 'checkInStatus', width: 15 },
      { header: 'Status Check Out', key: 'checkOutStatus', width: 15 },
      { header: 'Status Kehadiran', key: 'status', width: 20 },
      { header: 'Total Menit Kerja', key: 'totalWorkMinutes', width: 15 },
    ];

    for (const a of data) {
      worksheet.addRow({
        date: a.attendanceDate.toISOString().slice(0, 10),
        intern: a.internship?.internProfile?.user?.fullName ?? '-',
        email: a.internship?.internProfile?.user?.email ?? '-',
        department: a.internship?.department?.name ?? '-',
        office: a.internship?.officeLocation?.name ?? '-',
        checkIn: a.checkInAt
          ? `${new Date(a.checkInAt.getTime() + 7 * 60 * 60 * 1000)
              .toISOString()
              .slice(11, 16)} WIB`
          : '-',
        checkOut: a.checkOutAt
          ? `${new Date(a.checkOutAt.getTime() + 7 * 60 * 60 * 1000)
              .toISOString()
              .slice(11, 16)} WIB`
          : '-',
        checkInStatus: a.checkInStatus ?? '-',
        checkOutStatus: a.checkOutStatus ?? '-',
        status: a.attendanceStatus ?? '-',
        totalWorkMinutes: a.totalWorkMinutes ?? 0,
      });
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
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

  public async buildInitialAttendances(internshipId: string, startDate: Date, endDate: Date) {
    const calendarDays = await calendarService.getCalendarDays(startDate, endDate);

    return calendarDays.map((day) => {
      let status: string = AttendanceStatus.ABSENT;
      let checkInStatus: string | null = AttendanceStatus.ABSENT;
      let checkOutStatus: string | null = AttendanceStatus.ABSENT;
      let notes: string | null = null;

      if (day.status === 'WEEKEND' || day.status === 'HOLIDAY') {
        status = day.status;
        checkInStatus = null;
        checkOutStatus = null;
        notes = day.title;
      }

      return {
        internshipId,
        attendanceDate: new Date(`${day.date}T00:00:00.000Z`),
        checkInStatus,
        checkOutStatus,
        attendanceStatus: status,
        totalWorkMinutes: 0,
        notes,
      };
    });
  }

  public async generateInitialAttendances(
    tx: any,
    internshipId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const newAttendances = await this.buildInitialAttendances(internshipId, startDate, endDate);

    if (newAttendances.length > 0) {
      await tx.attendance.createMany({
        data: newAttendances,
        skipDuplicates: true,
      });
    }
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

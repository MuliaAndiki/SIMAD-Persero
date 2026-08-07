import { AppError } from '@/http/error';
import type {
  ChartsResponse,
  DashboardStatistics,
  HrDashboardResponse,
  InternDashboardResponse,
  RecentActivityQuery,
  RecentActivityResponse,
  SupervisorDashboardData,
} from '@/types/dashboard.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Dashboard.
 * Dashboard berbeda untuk setiap role (docs/07-api-specification.md §19).
 * Sumber aturan: docs/07-api-specification.md §19, docs/04-business-rules.md §27.
 */
class DashboardService {
  private readonly notificationInclude = {
    notificationReads: { where: { userId: '' }, select: { readAt: true } },
  };

  /** Tanggal hari ini dalam zona UTC+7 (pola sama dengan AttendanceService.getTodayRange). */
  private getTodayDate(): Date {
    const now = new Date();
    const dateStr = new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  /** Label bulan "YYYY-MM" untuk tanggal (UTC+7). */
  private monthLabelOf(date: Date): string {
    return new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 7);
  }

  /** Label bulan "YYYY-MM" untuk n bulan terakhir (dimulai bulan ini). */
  private buildMonthLabels(months: number): string[] {
    const labels: string[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return labels;
  }

  // ── 19.1 Intern Dashboard ───────────────────────────────────────────

  public async getInternDashboard(userId: string): Promise<InternDashboardResponse> {
    const internProfile = await prisma.internProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!internProfile) {
      throw new AppError(404, 'Profil intern tidak ditemukan.');
    }

    const internship = await prisma.internship.findFirst({
      where: { internProfileId: internProfile.id },
      include: {
        department: { select: { id: true, name: true } },
        officeLocation: { select: { id: true, name: true } },
        certificate: {
          select: { id: true, certificateNumber: true, generatedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayDate = this.getTodayDate();

    const [todayAttendance, notifications] = await Promise.all([
      internship
        ? prisma.attendance.findUnique({
            where: {
              internshipId_attendanceDate: {
                internshipId: internship.id,
                attendanceDate: todayDate,
              },
            },
          })
        : Promise.resolve(null),
      prisma.notification.findMany({
        where: {
          OR: [{ isBroadcast: true }, { notificationReads: { some: { userId } } }],
        },
        include: {
          notificationReads: { where: { userId }, select: { readAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      internship: internship
        ? {
            id: internship.id,
            status: internship.status,
            actualStartDate: internship.actualStartDate,
            actualEndDate: internship.actualEndDate,
            department: internship.department ?? null,
            officeLocation: internship.officeLocation ?? null,
          }
        : null,
      todayAttendance: todayAttendance
        ? {
            id: todayAttendance.id,
            attendanceDate: todayAttendance.attendanceDate,
            checkInAt: todayAttendance.checkInAt,
            checkOutAt: todayAttendance.checkOutAt,
            checkInStatus: todayAttendance.checkInStatus,
            checkOutStatus: todayAttendance.checkOutStatus,
            attendanceStatus: todayAttendance.attendanceStatus,
          }
        : null,
      notifications: notifications.map((n: (typeof notifications)[number]) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
        readAt: n.notificationReads?.[0]?.readAt ?? null,
      })),
      certificate: internship?.certificate ?? null,
    };
  }

  // ── 19.2 HR Dashboard ───────────────────────────────────────────────

  public async getHrDashboard(): Promise<HrDashboardResponse> {
    const todayDate = this.getTodayDate();

    const [
      pendingApplications,
      activeInternships,
      attendanceToday,
      certificatesGenerated,
      totalSupervisors,
    ] = await prisma.$transaction([
      prisma.internshipApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      prisma.internship.count({ where: { status: 'ACTIVE' } }),
      prisma.attendance.count({ where: { attendanceDate: todayDate } }),
      prisma.certificate.count(),
      prisma.user.count({
        where: { userRoles: { some: { role: { code: 'SUPERVISOR' } } } },
      }),
    ]);

    return {
      pendingApplications,
      activeInternships,
      attendanceToday,
      certificatesGenerated,
      totalSupervisors,
    };
  }

  // ── 19.3 Supervisor Dashboard ───────────────────────────────────────

  public async getSupervisorDashboard(userId: string): Promise<SupervisorDashboardData> {
    const assignments = await prisma.supervisorAssignment.findMany({
      where: { supervisorId: userId, isActive: true },
      select: { internshipId: true },
    });

    const internshipIds = assignments
      .map((a) => a.internshipId)
      .filter((id): id is string => Boolean(id));

    const departmentParticipants = internshipIds.length;

    const todayDate = this.getTodayDate();

    const todayAttendances = internshipIds.length
      ? await prisma.attendance.findMany({
          where: {
            internshipId: { in: internshipIds },
            attendanceDate: todayDate,
          },
          select: { attendanceStatus: true },
        })
      : [];

    const present = todayAttendances.filter(
      (a) =>
        a.attendanceStatus === 'PRESENT' ||
        a.attendanceStatus === 'LATE' ||
        a.attendanceStatus === 'COMPLETED',
    ).length;
    const invalidAttendance = todayAttendances.filter(
      (a) => a.attendanceStatus === 'INVALID',
    ).length;
    const notCheckedIn = Math.max(departmentParticipants - todayAttendances.length, 0);

    return {
      departmentParticipants,
      notCheckedIn,
      present,
      invalidAttendance,
    };
  }

  // ── 19.4 Dashboard Statistics ───────────────────────────────────────

  public async getStatistics(): Promise<DashboardStatistics> {
    const todayDate = this.getTodayDate();

    const [
      totalUsers,
      totalInterns,
      totalDepartments,
      totalOffices,
      totalApplications,
      approvedApplications,
      pendingApplications,
      activeInternships,
      completedInternships,
      totalSupervisors,
      totalAttendance,
      attendanceToday,
      certificatesGenerated,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.internProfile.count(),
      prisma.department.count(),
      prisma.officeLocation.count(),
      prisma.internshipApplication.count(),
      prisma.internshipApplication.count({ where: { status: 'APPROVED' } }),
      prisma.internshipApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      prisma.internship.count({ where: { status: 'ACTIVE' } }),
      prisma.internship.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({
        where: { userRoles: { some: { role: { code: 'SUPERVISOR' } } } },
      }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { attendanceDate: todayDate } }),
      prisma.certificate.count(),
    ]);

    return {
      totalUsers,
      totalInterns,
      totalDepartments,
      totalOffices,
      totalApplications,
      approvedApplications,
      pendingApplications,
      activeInternships,
      completedInternships,
      totalSupervisors,
      totalAttendance,
      attendanceToday,
      certificatesGenerated,
    };
  }

  // ── 19.5 Dashboard Chart ────────────────────────────────────────────

  public async getCharts(): Promise<ChartsResponse> {
    const months = 6;
    const labels = this.buildMonthLabels(months);
    const startMonth = new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1);

    const [attendances, internships, grouped] = await Promise.all([
      prisma.attendance.findMany({
        where: { attendanceDate: { gte: startMonth } },
        select: { attendanceDate: true, attendanceStatus: true },
      }),
      prisma.internship.findMany({
        where: {
          OR: [{ actualStartDate: { gte: startMonth } }, { completedAt: { gte: startMonth } }],
        },
        select: { actualStartDate: true, completedAt: true },
      }),
      prisma.internship.groupBy({
        by: ['departmentId'],
        where: { departmentId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    // Attendance Trend
    const attendanceBuckets: Record<
      string,
      { month: string; present: number; late: number; invalid: number }
    > = {};
    for (const label of labels) {
      attendanceBuckets[label] = {
        month: label,
        present: 0,
        late: 0,
        invalid: 0,
      };
    }
    for (const a of attendances) {
      const bucket = attendanceBuckets[this.monthLabelOf(a.attendanceDate)];
      if (!bucket) continue;
      if (a.attendanceStatus === 'PRESENT' || a.attendanceStatus === 'COMPLETED') {
        bucket.present += 1;
      } else if (a.attendanceStatus === 'LATE') {
        bucket.late += 1;
      } else if (a.attendanceStatus === 'INVALID') {
        bucket.invalid += 1;
      }
    }
    const attendanceTrend = labels.map((label) => attendanceBuckets[label]);

    // Internship Trend
    const internshipBuckets: Record<string, { month: string; started: number; completed: number }> =
      {};
    for (const label of labels) {
      internshipBuckets[label] = { month: label, started: 0, completed: 0 };
    }
    for (const i of internships) {
      if (i.actualStartDate) {
        const bucket = internshipBuckets[this.monthLabelOf(i.actualStartDate)];
        if (bucket) bucket.started += 1;
      }
      if (i.completedAt) {
        const bucket = internshipBuckets[this.monthLabelOf(i.completedAt)];
        if (bucket) bucket.completed += 1;
      }
    }
    const internshipTrend = labels.map((label) => internshipBuckets[label]);

    // Department Distribution
    const departmentIds = grouped
      .map((g) => g.departmentId)
      .filter((id): id is string => Boolean(id));
    const departments = departmentIds.length
      ? await prisma.department.findMany({
          where: { id: { in: departmentIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameMap = new Map(departments.map((d) => [d.id, d.name ?? '-']));
    const departmentDistribution = grouped
      .map((g) => ({
        department: nameMap.get(g.departmentId ?? '') ?? '-',
        internCount: g._count._all,
      }))
      .sort((a, b) => b.internCount - a.internCount);

    return { attendanceTrend, internshipTrend, departmentDistribution };
  }

  // ── 19.6 Recent Activities ──────────────────────────────────────────

  public async getRecentActivities(query: RecentActivityQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    const [total, activities] = await prisma.$transaction([
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data: RecentActivityResponse[] = activities.map((a: (typeof activities)[number]) => ({
      id: a.id,
      user: a.user ?? null,
      activity: a.activity,
      description: a.description,
      createdAt: a.createdAt,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new DashboardService();

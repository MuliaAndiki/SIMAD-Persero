import type {
  AttendanceReportRow,
  CertificateReportRow,
  DashboardReportData,
  InternshipReportRow,
  ReportingQuery,
} from '@/types/reporting.types';
import prisma from '../../prisma/client';

/**
 * Service layer modul Reporting.
 * Hanya dapat diakses HR (BR-REPORT-001).
 * Sumber aturan: docs/07-api-specification.md §26, docs/04-business-rules.md §28.
 */
class ReportingService {
  /**
   * 26.1 Attendance Report.
   * Filter: departmentId, month, year (BR-REPORT-003).
   * format=xlsx dikembalikan sebagai JSON — generasi .xlsx adalah future
   * enhancement (konsisten dengan AttendanceService.exportAttendance).
   */
  public async getAttendanceReport(query: ReportingQuery): Promise<AttendanceReportRow[]> {
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
                institution: { select: { name: true } },
              },
            },
            department: { select: { name: true } },
            officeLocation: { select: { name: true } },
          },
        },
      },
      orderBy: { attendanceDate: 'desc' },
    });

    return data.map((a: (typeof data)[number]) => ({
      date: a.attendanceDate,
      intern: a.internship?.internProfile?.user?.fullName ?? '-',
      email: a.internship?.internProfile?.user?.email ?? '-',
      studentNumber: a.internship?.internProfile?.studentNumber ?? '-',
      institution: a.internship?.internProfile?.institution?.name ?? '-',
      department: a.internship?.department?.name ?? '-',
      office: a.internship?.officeLocation?.name ?? '-',
      checkInAt: a.checkInAt,
      checkOutAt: a.checkOutAt,
      checkInStatus: a.checkInStatus,
      checkOutStatus: a.checkOutStatus,
      status: a.attendanceStatus,
      totalWorkMinutes: a.totalWorkMinutes,
    }));
  }

  /**
   * 26.2 Internship Report.
   * Daftar peserta magang beserta department, office, dan supervisor aktif.
   */
  public async getInternshipReport(): Promise<InternshipReportRow[]> {
    const data = await prisma.internship.findMany({
      include: {
        internProfile: {
          include: {
            user: { select: { fullName: true, email: true } },
            institution: { select: { name: true } },
            major: { select: { name: true } },
          },
        },
        department: { select: { name: true } },
        officeLocation: { select: { name: true } },
        supervisorAssignments: {
          where: { isActive: true },
          include: { supervisor: { select: { fullName: true } } },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((i: (typeof data)[number]) => ({
      intern: i.internProfile?.user?.fullName ?? '-',
      email: i.internProfile?.user?.email ?? '-',
      studentNumber: i.internProfile?.studentNumber ?? '-',
      institution: i.internProfile?.institution?.name ?? '-',
      major: i.internProfile?.major?.name ?? '-',
      department: i.department?.name ?? '-',
      office: i.officeLocation?.name ?? '-',
      actualStartDate: i.actualStartDate,
      actualEndDate: i.actualEndDate,
      status: i.status,
      supervisor: i.supervisorAssignments?.[0]?.supervisor?.fullName ?? '-',
    }));
  }

  /**
   * 26.3 Certificate Report.
   * Daftar sertifikat yang telah di-generate.
   */
  public async getCertificateReport(): Promise<CertificateReportRow[]> {
    const data = await prisma.certificate.findMany({
      include: {
        internship: {
          include: {
            internProfile: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
            department: { select: { name: true } },
          },
        },
        generatedBy: { select: { fullName: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return data.map((c: (typeof data)[number]) => ({
      certificateNumber: c.certificateNumber ?? '-',
      intern: c.internship?.internProfile?.user?.fullName ?? '-',
      email: c.internship?.internProfile?.user?.email ?? '-',
      department: c.internship?.department?.name ?? '-',
      generatedAt: c.generatedAt,
      generatedBy: c.generatedBy?.fullName ?? '-',
    }));
  }

  /**
   * 26.4 Dashboard Report.
   * Ringkasan statistik sistem untuk laporan.
   */
  public async getDashboardReport(): Promise<DashboardReportData> {
    const todayDate = this.getTodayDate();

    const [
      totalDepartments,
      totalOffices,
      totalInterns,
      totalApplications,
      pendingApplications,
      approvedApplications,
      activeInternships,
      completedInternships,
      totalSupervisors,
      totalAttendance,
      attendanceToday,
      certificatesGenerated,
    ] = await prisma.$transaction([
      prisma.department.count(),
      prisma.officeLocation.count(),
      prisma.internProfile.count(),
      prisma.internshipApplication.count(),
      prisma.internshipApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      prisma.internshipApplication.count({ where: { status: 'APPROVED' } }),
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
      totalDepartments,
      totalOffices,
      totalInterns,
      totalApplications,
      pendingApplications,
      approvedApplications,
      activeInternships,
      completedInternships,
      totalSupervisors,
      totalAttendance,
      attendanceToday,
      certificatesGenerated,
    };
  }

  /** Tanggal hari ini dalam zona UTC+7 (pola sama dengan AttendanceService.getTodayRange). */
  private getTodayDate(): Date {
    const now = new Date();
    const dateStr = new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
}

export default new ReportingService();

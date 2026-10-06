'use client';

import { ReportsSection } from '@/components/page/hr/ReportsSection';
import type { ReportsTab } from '@/components/page/hr/ReportsSection';
import { useApi } from '@/hooks/useService/useApi';
import type { AttendanceReportRow } from '@/types/api/reporting.types';
import { useCallback, useState } from 'react';

/**
 * Container halaman Laporan (HR Admin) — orchestration layer.
 *
 * Menarik keempat sumber laporan: absensi (GET /reports/attendance),
 * peserta magang (GET /reports/internships), sertifikat
 * (GET /reports/certificates), dan ringkasan (GET /reports/dashboard).
 * Section hanya presentasi — menerima `state` + aksi tab & retry.
 */
export default function HrReportsContainer() {
  const api = useApi();

  const [activeTab, setActiveTab] = useState<ReportsTab>('attendance');

  // Staged filter state untuk Laporan Absensi
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Pagination state untuk Laporan Absensi
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Muat daftar kantor dan internship untuk cascading selector
  const offices = api.office.query.list({ limit: 100 });
  const allInternships = api.internship.query.list({ limit: 200 });

  // Absensi di-query saat tab attendance aktif (mendukung pagination dan query server-side)
  const attendance = api.reporting.query.attendance(
    {
      officeLocationId: selectedOfficeId || undefined,
      departmentId: selectedDepartmentId || undefined,
      internshipId: selectedInternshipId || undefined,
      month: selectedMonth,
      year: selectedYear,
      page,
      limit,
    },
    { enabled: activeTab === 'attendance' },
  );

  const internships = api.reporting.query.internships({
    enabled: activeTab === 'internships',
  });
  const certificates = api.reporting.query.certificates({
    enabled: activeTab === 'certificates',
  });
  const dashboard = api.reporting.query.dashboard({
    enabled: activeTab === 'dashboard',
  });

  const handleTabChange = useCallback((tab: ReportsTab) => {
    setActiveTab(tab);
  }, []);

  const handleSelectOffice = useCallback((officeId: string) => {
    setSelectedOfficeId(officeId);
    setSelectedDepartmentId('');
    setSelectedInternshipId('');
    setPage(1);
  }, []);

  const handleSelectDepartment = useCallback((departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedInternshipId('');
    setPage(1);
  }, []);

  const handleSelectInternship = useCallback((internshipId: string) => {
    setSelectedInternshipId(internshipId);
    setPage(1);
  }, []);

  const handleSelectMonth = useCallback((month?: number) => {
    setSelectedMonth(month);
    setPage(1);
  }, []);

  const handleSelectYear = useCallback((year?: number) => {
    setSelectedYear(year);
    setPage(1);
  }, []);

  const handleResetAttendanceFilter = useCallback(() => {
    setSelectedOfficeId('');
    setSelectedDepartmentId('');
    setSelectedInternshipId('');
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setPage(1);
  }, []);

  const handleQueryAll = useCallback(() => {
    setSelectedOfficeId('');
    setSelectedDepartmentId('');
    setSelectedInternshipId('');
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleRetry = useCallback(
    (tab: ReportsTab) => {
      if (tab === 'attendance') void attendance.refetch();
      if (tab === 'internships') void internships.refetch();
      if (tab === 'certificates') void certificates.refetch();
      if (tab === 'dashboard') void dashboard.refetch();
    },
    [attendance, certificates, dashboard, internships],
  );

  // Normalisasi data & metadata pagination
  const attendanceRows: AttendanceReportRow[] = Array.isArray(attendance.data?.data)
    ? (attendance.data.data as AttendanceReportRow[])
    : Array.isArray(attendance.data)
      ? (attendance.data as AttendanceReportRow[])
      : [];

  const meta = (attendance.data as any)?.meta ?? {};
  const totalItems = Number(meta.total ?? attendanceRows.length);
  const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(totalItems / limit)));

  return (
    <ReportsSection
      state={{
        activeTab,
        attendance: attendanceRows,
        isAttendancePending: attendance.isPending,
        isAttendanceError: attendance.isError,
        attendanceErrorMessage: attendance.error?.message,
        attendancePage: page,
        attendanceTotalPages: totalPages,
        attendanceTotalItems: totalItems,
        attendanceLimit: limit,
        internships: internships.data ?? [],
        isInternshipsPending: internships.isPending,
        isInternshipsError: internships.isError,
        internshipsErrorMessage: internships.error?.message,
        certificates: certificates.data ?? [],
        isCertificatesPending: certificates.isPending,
        isCertificatesError: certificates.isError,
        certificatesErrorMessage: certificates.error?.message,
        dashboard: dashboard.data ?? null,
        isDashboardPending: dashboard.isPending,
        isDashboardError: dashboard.isError,
        dashboardErrorMessage: dashboard.error?.message,
        offices: offices.data ?? [],
        allInternships:
          allInternships.data?.data ??
          (Array.isArray(allInternships.data) ? allInternships.data : []),
        selectedOfficeId,
        selectedDepartmentId,
        selectedInternshipId,
        selectedMonth,
        selectedYear,
      }}
      actions={{
        onTabChange: handleTabChange,
        onRetry: handleRetry,
        onSelectOffice: handleSelectOffice,
        onSelectDepartment: handleSelectDepartment,
        onSelectInternship: handleSelectInternship,
        onSelectMonth: handleSelectMonth,
        onSelectYear: handleSelectYear,
        onResetAttendanceFilter: handleResetAttendanceFilter,
        onQueryAll: handleQueryAll,
        onAttendancePageChange: handlePageChange,
        onAttendanceLimitChange: handleLimitChange,
      }}
    />
  );
}

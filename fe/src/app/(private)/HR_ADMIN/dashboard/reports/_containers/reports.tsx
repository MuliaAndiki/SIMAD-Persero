'use client';

import { ReportsSection } from '@/components/page/hr/ReportsSection';
import type { ReportsTab } from '@/components/page/hr/ReportsSection';
import { useApi } from '@/hooks/useService/useApi';
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

  const attendance = api.reporting.query.attendance();
  const internships = api.reporting.query.internships();
  const certificates = api.reporting.query.certificates();
  const dashboard = api.reporting.query.dashboard();

  const handleTabChange = useCallback((tab: ReportsTab) => {
    setActiveTab(tab);
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

  return (
    <ReportsSection
      state={{
        activeTab,
        attendance: attendance.data ?? [],
        isAttendancePending: attendance.isPending,
        isAttendanceError: attendance.isError,
        attendanceErrorMessage: attendance.error?.message,
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
      }}
      actions={{ onTabChange: handleTabChange, onRetry: handleRetry }}
    />
  );
}

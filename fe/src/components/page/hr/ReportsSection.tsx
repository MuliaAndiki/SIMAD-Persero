'use client';

import { Button } from '@/components/atoms/button';
import { AttendanceReportTable } from '@/components/organisms/reporting/AttendanceReportTable';
import { CertificatesReportTable } from '@/components/organisms/reporting/CertificatesReportTable';
import { DashboardReportGrid } from '@/components/organisms/reporting/DashboardReportGrid';
import { InternshipsReportTable } from '@/components/organisms/reporting/InternshipsReportTable';
import type {
  AttendanceReportRow,
  CertificateReportRow,
  DashboardReportData,
  InternshipReportRow,
} from '@/types/api/reporting.types';
import { BarChart3, CalendarCheck, ScrollText, Users } from 'lucide-react';

export type ReportsTab = 'attendance' | 'internships' | 'certificates' | 'dashboard';

export interface ReportsSectionState {
  activeTab: ReportsTab;
  attendance: AttendanceReportRow[];
  isAttendancePending: boolean;
  isAttendanceError: boolean;
  attendanceErrorMessage?: string;
  internships: InternshipReportRow[];
  isInternshipsPending: boolean;
  isInternshipsError: boolean;
  internshipsErrorMessage?: string;
  certificates: CertificateReportRow[];
  isCertificatesPending: boolean;
  isCertificatesError: boolean;
  certificatesErrorMessage?: string;
  dashboard: DashboardReportData | null;
  isDashboardPending: boolean;
  isDashboardError: boolean;
  dashboardErrorMessage?: string;
}

export interface ReportsSectionActions {
  onTabChange: (tab: ReportsTab) => void;
  onRetry: (tab: ReportsTab) => void;
}

export interface ReportsSectionProps {
  state: ReportsSectionState;
  actions: ReportsSectionActions;
}

const TABS: { value: ReportsTab; label: string; icon: typeof BarChart3 }[] = [
  { value: 'attendance', label: 'Absensi', icon: CalendarCheck },
  { value: 'internships', label: 'Peserta Magang', icon: Users },
  { value: 'certificates', label: 'Sertifikat', icon: ScrollText },
  { value: 'dashboard', label: 'Ringkasan', icon: BarChart3 },
];

export function ReportsSection({ state, actions }: ReportsSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
        <p className="text-sm text-muted-foreground">
          Rekap absensi, peserta magang, sertifikat, dan ringkasan sistem.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.value;
          return (
            <Button
              key={tab.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => actions.onTabChange(tab.value)}
            >
              <Icon className="size-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {state.activeTab === 'attendance' && (
        <AttendanceReportTable
          rows={state.attendance}
          isPending={state.isAttendancePending}
          isError={state.isAttendanceError}
          errorMessage={state.attendanceErrorMessage}
          onRetry={() => actions.onRetry('attendance')}
        />
      )}
      {state.activeTab === 'internships' && (
        <InternshipsReportTable
          rows={state.internships}
          isPending={state.isInternshipsPending}
          isError={state.isInternshipsError}
          errorMessage={state.internshipsErrorMessage}
          onRetry={() => actions.onRetry('internships')}
        />
      )}
      {state.activeTab === 'certificates' && (
        <CertificatesReportTable
          rows={state.certificates}
          isPending={state.isCertificatesPending}
          isError={state.isCertificatesError}
          errorMessage={state.certificatesErrorMessage}
          onRetry={() => actions.onRetry('certificates')}
        />
      )}
      {state.activeTab === 'dashboard' && (
        <DashboardReportGrid
          data={state.dashboard}
          isPending={state.isDashboardPending}
          isError={state.isDashboardError}
          errorMessage={state.dashboardErrorMessage}
          onRetry={() => actions.onRetry('dashboard')}
        />
      )}
    </section>
  );
}

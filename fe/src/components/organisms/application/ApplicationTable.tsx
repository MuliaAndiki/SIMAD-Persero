'use client';

import { REVIEWABLE_STATUSES } from '@/components/organisms/application/ApplicationReviewDetail';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import type { ApplicationResponse, ApplicationStatusValue } from '@/types/api/application.types';
import { formatDate } from '@/utils/string.format';
import { CheckCircle2, Eye, FileText, XCircle } from 'lucide-react';

export interface ApplicationTableProps {
  applications: ApplicationResponse[];
  onSelectApplication: (id: string) => void;
  onApprove: (app: ApplicationResponse) => void;
  onReject: (app: ApplicationResponse) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

/**
 * ApplicationTable — organism tabel daftar pengajuan magang (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function ApplicationTable({
  applications,
  onSelectApplication,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ApplicationTableProps) {
  return (
    <DataTableCard
      title="Daftar Pengajuan"
      description={`${applications.length} pengajuan ditemukan`}
      columns={[
        { label: 'No. Pengajuan' },
        { label: 'Peserta' },
        { label: 'Periode' },
        { label: 'Status' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={applications.length === 0}
      emptyIcon={FileText}
      emptyMessage="Belum ada pengajuan yang cocok dengan filter."
    >
      {applications.map((app) => {
        const reviewable = REVIEWABLE_STATUSES.includes(app.status as ApplicationStatusValue);
        return (
          <tr key={app.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
            <td className="px-6 py-4 font-medium">{app.applicationNumber ?? '-'}</td>
            <td className="px-6 py-4">
              <div className="flex flex-col">
                <span className="font-medium">{app.internProfile?.user.fullName ?? '-'}</span>
                <span className="text-xs text-muted-foreground">
                  {app.internProfile?.studentNumber || app.internProfile?.user.email}{' '}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-0.5">
                <span>{formatDate(app.requestedStartDate)}</span>
                <span className="text-xs text-muted-foreground">
                  s.d. {formatDate(app.requestedEndDate)}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={app.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <RowActionsMenu
                items={[
                  {
                    key: 'review',
                    label: 'Review',
                    icon: Eye,
                    onSelect: () => onSelectApplication(app.id),
                  },
                  {
                    key: 'approve',
                    label: 'Setujui',
                    icon: CheckCircle2,
                    hidden: !reviewable,
                    disabled: isApproving || isRejecting,
                    onSelect: () => onApprove(app),
                  },
                  {
                    key: 'reject',
                    label: 'Tolak',
                    icon: XCircle,
                    variant: 'destructive',
                    hidden: !reviewable,
                    disabled: isApproving || isRejecting,
                    onSelect: () => onReject(app),
                  },
                ]}
              />
            </td>
          </tr>
        );
      })}
    </DataTableCard>
  );
}

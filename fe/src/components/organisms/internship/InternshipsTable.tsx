'use client';

import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import { TablePagination } from '@/components/organisms/table/TablePagination';
import type { InternshipResponse } from '@/types/api/internship.types';
import { formatDate } from '@/utils/string.format';
import {
  Archive,
  Award,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Play,
  UserCheck,
  Users,
} from 'lucide-react';

export interface InternshipsTableProps {
  internships: InternshipResponse[];
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onStart?: (id: string) => void;
  onFinish?: (id: string) => void;
  onOpenExtend?: (internship: InternshipResponse) => void;
  onOpenRescheduleStartDate?: (internship: InternshipResponse) => void;
  onOpenChangeDept?: (internship: InternshipResponse) => void;
  onOpenAssignSupervisor?: (internship: InternshipResponse) => void;
  onOpenGenerateCert?: (internship: InternshipResponse) => void;
  onArchive?: (id: string) => void;
}

/**
 * InternshipsTable — organism tabel daftar magang & pusat kontrol (HR Admin).
 */
export function InternshipsTable({
  internships,
  page = 1,
  totalPages = 1,
  total = internships.length,
  onPageChange,
  onStart,
  onFinish,
  onOpenExtend,
  onOpenRescheduleStartDate,
  onOpenChangeDept,
  onOpenAssignSupervisor,
  onOpenGenerateCert,
  onArchive,
}: InternshipsTableProps) {
  return (
    <DataTableCard
      title="Daftar Magang"
      description={
        <>
          {total} magang ditemukan
          {totalPages > 1 ? ` • Halaman ${page} dari ${totalPages}` : ''}
        </>
      }
      columns={[
        { label: 'Peserta' },
        { label: 'Instansi' },
        { label: 'Jurusan' },
        { label: 'Kantor' },
        { label: 'Departemen' },
        { label: 'Supervisor' },
        { label: 'Periode' },
        { label: 'Status' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={internships.length === 0}
      emptyIcon={Users}
      emptyMessage="Belum ada magang yang cocok dengan filter."
      footer={
        onPageChange ? (
          <TablePagination
            page={page}
            totalPages={totalPages}
            description={
              <>
                Menampilkan {internships.length} dari {total} magang (Halaman {page} dari{' '}
                {totalPages})
              </>
            }
            onPageChange={onPageChange}
          />
        ) : undefined
      }
    >
      {internships.map((internship) => {
        const supervisor = internship.supervisorAssignments?.[0]?.supervisor?.fullName ?? '-';
        const archivable =
          internship.status === 'COMPLETED' || internship.status === 'CERTIFICATE_GENERATED';

        return (
          <tr
            key={internship.id}
            className="border-b transition-colors last:border-0 hover:bg-muted/40"
          >
            <td className="px-6 py-4">
              <div className="flex flex-col">
                <span className="font-medium">
                  {internship.internProfile?.user.fullName ?? '-'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {internship.internProfile?.studentNumber || internship.internProfile?.user.email}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">{internship.internProfile?.institution?.name ?? '-'}</td>
            <td className="px-6 py-4">{internship.internProfile?.major?.name ?? '-'}</td>
            <td className="px-6 py-4">{internship.officeLocation?.name ?? '-'}</td>
            <td className="px-6 py-4">{internship.department?.name ?? '-'}</td>
            <td className="px-6 py-4">{supervisor}</td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-0.5">
                <span>{formatDate(internship.actualStartDate)}</span>
                <span className="text-xs text-muted-foreground">
                  s.d. {formatDate(internship.actualEndDate)}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={internship.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <RowActionsMenu
                label="Aksi Magang"
                contentClassName="w-52"
                items={[
                  {
                    key: 'start',
                    label: 'Mulai Magang',
                    icon: Play,
                    hidden: !(internship.status === 'PENDING' && onStart),
                    onSelect: () => onStart?.(internship.id),
                  },
                  {
                    key: 'finish',
                    label: 'Selesaikan Magang',
                    icon: CheckCircle2,
                    hidden: !(internship.status === 'ACTIVE' && onFinish),
                    onSelect: () => onFinish?.(internship.id),
                  },
                  {
                    key: 'certificate',
                    label: 'Terbitkan Sertifikat',
                    icon: Award,
                    hidden: !(internship.status === 'COMPLETED' && onOpenGenerateCert),
                    onSelect: () => onOpenGenerateCert?.(internship),
                  },
                  {
                    key: 'extend',
                    label: 'Perpanjang Magang',
                    icon: Calendar,
                    hidden: !onOpenExtend,
                    onSelect: () => onOpenExtend?.(internship),
                  },
                  {
                    key: 'reschedule-start-date',
                    label: 'Ubah Tanggal Masuk',
                    icon: CalendarClock,
                    hidden: !(internship.status === 'PENDING' && onOpenRescheduleStartDate),
                    onSelect: () => onOpenRescheduleStartDate?.(internship),
                  },
                  {
                    key: 'change-dept',
                    label: 'Pindahkan Departemen',
                    icon: Building2,
                    hidden: !onOpenChangeDept,
                    onSelect: () => onOpenChangeDept?.(internship),
                  },
                  {
                    key: 'assign-supervisor',
                    label: 'Tugaskan Supervisor',
                    icon: UserCheck,
                    hidden: !onOpenAssignSupervisor,
                    onSelect: () => onOpenAssignSupervisor?.(internship),
                  },
                  {
                    key: 'archive',
                    label: 'Arsipkan',
                    icon: Archive,
                    variant: 'destructive',
                    hidden: !(archivable && onArchive),
                    onSelect: () => onArchive?.(internship.id),
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

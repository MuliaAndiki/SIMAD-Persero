'use client';

import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import type { AlertContexType } from '@/types/ui';
import { Briefcase, Building2, Eye, Pencil, Trash2, UserCheck } from 'lucide-react';

export interface SupervisorTableProps {
  supervisors: SupervisorResponse[];
  offices?: OfficeResponse[];
  departments?: DepartmentResponse[];
  onSelectSupervisor: (id: string) => void;
  onEditSupervisor?: (id: string) => void;
  onDeleteSupervisor?: (id: string) => void;
  onViewAuditLog?: (userId: string, userName: string) => void;
  alert: AlertContexType;
}

/**
 * SupervisorTable — organism tabel daftar supervisor (HR Admin).
 */
export function SupervisorTable({
  supervisors,
  offices,
  departments,
  onSelectSupervisor,
  onEditSupervisor,
  onDeleteSupervisor,
  onViewAuditLog,
  alert,
}: SupervisorTableProps) {
  const getOfficeName = (supervisor: SupervisorResponse) => {
    if (supervisor.officeLocation?.name) return supervisor.officeLocation.name;
    if (supervisor.officeId && offices) {
      const found = offices.find((o) => o.id === supervisor.officeId);
      if (found) return found.name;
    }
    return '-';
  };

  const getDeptName = (supervisor: SupervisorResponse) => {
    if (supervisor.department?.name) return supervisor.department.name;
    if (supervisor.departmentId && departments) {
      const found = departments.find((d) => d.id === supervisor.departmentId);
      if (found) return found.name;
    }
    return '-';
  };

  return (
    <DataTableCard
      title="Daftar Supervisor"
      description={`${supervisors.length} supervisor ditemukan`}
      columns={[
        { label: 'Nama' },
        { label: 'Email' },
        { label: 'Kantor' },
        { label: 'Departemen' },
        { label: 'Status' },
        { label: 'Bimbingan Aktif' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={supervisors.length === 0}
      emptyIcon={UserCheck}
      emptyMessage="Belum ada supervisor yang cocok dengan filter."
    >
      {supervisors.map((supervisor) => (
        <tr
          key={supervisor.id}
          className="border-b transition-colors last:border-0 hover:bg-muted/40"
        >
          <td className="px-6 py-4 font-medium">{supervisor.fullName}</td>
          <td className="px-6 py-4 text-muted-foreground">{supervisor.email}</td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
              <span>{getOfficeName(supervisor)}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
              <span>{getDeptName(supervisor)}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <StatusBadge active={supervisor.isActive} />
          </td>
          <td className="px-6 py-4">{supervisor.activeAssignmentsCount}</td>

          <td className="px-6 py-4 text-right">
            <RowActionsMenu
              label="Opsi"
              contentClassName="w-52"
              items={[
                {
                  key: 'detail',
                  label: 'Detail',
                  icon: Eye,
                  hidden: !onSelectSupervisor,
                  onSelect: () => onSelectSupervisor?.(supervisor.id),
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: Pencil,
                  hidden: !onEditSupervisor,
                  onSelect: () => onEditSupervisor?.(supervisor.id),
                },
                {
                  key: 'history',
                  label: 'History',
                  hidden: !onViewAuditLog || !supervisor.id,
                  onSelect: () => onViewAuditLog?.(supervisor.id, supervisor.fullName),
                },
                {
                  key: 'delete',
                  label: 'Hapus',
                  icon: Trash2,
                  variant: 'destructive',
                  hidden: !onDeleteSupervisor,
                  onSelect: () =>
                    alert.confirm({
                      title: 'Hapus',
                      deskripsi: 'Apakah Kamu Ingin Menghapus Supervisor Ini?',
                      icon: 'question',
                      confirmButtonText: 'Hapus',
                      onConfirm: () => {
                        onDeleteSupervisor?.(supervisor.id);
                      },
                    }),
                },
              ]}
            />
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}

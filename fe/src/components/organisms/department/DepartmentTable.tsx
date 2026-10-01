'use client';

import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { type RowActionItem, RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import type { DepartmentResponse } from '@/types/api/department.types';
import { Building2, Pencil, Power } from 'lucide-react';

export interface DepartmentTableProps {
  departments: DepartmentResponse[];
  onOpenEdit: (department: DepartmentResponse) => void;
  onToggleActive: (department: DepartmentResponse) => void;
}

/**
 * DepartmentTable — organism tabel daftar departemen (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function DepartmentTable({ departments, onOpenEdit, onToggleActive }: DepartmentTableProps) {
  return (
    <DataTableCard
      title="Daftar Departemen"
      description={`${departments.length} departemen ditemukan`}
      columns={[
        { label: 'Kode' },
        { label: 'Nama' },
        { label: 'Deskripsi' },
        { label: 'Status' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={departments.length === 0}
      emptyIcon={Building2}
      emptyMessage="Belum ada departemen yang cocok dengan filter."
    >
      {departments.map((department) => {
        const actions: RowActionItem[] = [
          {
            key: 'edit',
            label: 'Edit',
            icon: Pencil,
            onSelect: () => onOpenEdit(department),
          },
          {
            key: 'toggle',
            label: department.isActive ? 'Nonaktifkan' : 'Aktifkan',
            icon: Power,
            onSelect: () => onToggleActive(department),
          },
        ];
        return (
          <tr
            key={department.id}
            className="border-b transition-colors last:border-0 hover:bg-muted/40"
          >
            <td className="px-6 py-4 font-medium">{department.code}</td>
            <td className="px-6 py-4">{department.name}</td>
            <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
              {department.description || '-'}
            </td>
            <td className="px-6 py-4">
              <StatusBadge active={department.isActive} />
            </td>
            <td className="px-6 py-4 text-right">
              <RowActionsMenu items={actions} />
            </td>
          </tr>
        );
      })}
    </DataTableCard>
  );
}

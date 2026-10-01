'use client';

import { Badge } from '@/components/atoms/badge';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import { TablePagination } from '@/components/organisms/table/TablePagination';
import type { OfficeResponse } from '@/types/api/office.types';
import type { ReceptionistResponse } from '@/types/api/receptionist.types';
import type { AlertContexType } from '@/types/ui';
import { Building2, Pencil, Trash2, UserCog } from 'lucide-react';

export interface ReceptionistTableProps {
  receptionists: ReceptionistResponse[];
  offices: OfficeResponse[];
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  alert: AlertContexType;
}

export function ReceptionistTable({
  receptionists,
  offices,
  page = 1,
  totalPages = 1,
  total,
  onPageChange,
  onEdit,
  onDelete,
  alert,
}: ReceptionistTableProps) {
  const getOfficeName = (item: ReceptionistResponse) => {
    if (item.officeLocation?.name) return item.officeLocation.name;
    if (!item.officeId) return '-';
    return offices.find((o) => o.id === item.officeId)?.name ?? '-';
  };

  return (
    <DataTableCard
      title="Daftar Resepsionis"
      description={
        total != null
          ? `${total} resepsionis terdaftar`
          : `${receptionists.length} resepsionis ditemukan`
      }
      columns={[
        { label: 'Nama' },
        { label: 'Email' },
        { label: 'Kantor Penugasan' },
        { label: 'Cakupan Akses' },
        { label: 'Status' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={receptionists.length === 0}
      emptyIcon={UserCog}
      emptyMessage="Belum ada resepsionis yang terdaftar."
      footer={
        onPageChange ? (
          <TablePagination
            page={page}
            totalPages={totalPages}
            description={
              <>
                Halaman {page} dari {totalPages} {total != null ? `(${total} resepsionis)` : ''}
              </>
            }
            onPageChange={onPageChange}
          />
        ) : undefined
      }
    >
      {receptionists.map((item) => (
        <tr key={item.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
          <td className="px-6 py-4 font-medium">{item.fullName}</td>
          <td className="px-6 py-4 text-muted-foreground">{item.email}</td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">{getOfficeName(item)}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary text-[11px] font-medium border-primary/20"
            >
              Semua Departemen
            </Badge>
          </td>
          <td className="px-6 py-4">
            <StatusBadge active={item.isActive} />
          </td>

          <td className="px-6 py-4 text-right">
            <RowActionsMenu
              items={[
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: Pencil,
                  onSelect: () => onEdit(item.id),
                },
                {
                  key: 'delete',
                  label: 'Hapus',
                  icon: Trash2,
                  variant: 'destructive',
                  onSelect: () =>
                    alert.confirm({
                      title: 'Hapus Resepsionis?',
                      deskripsi: 'Akun ini akan dinonaktifkan dan tidak bisa login kembali.',
                      icon: 'question',
                      confirmButtonText: 'Hapus',
                      onConfirm: () => onDelete(item.id),
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

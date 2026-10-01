'use client';

import { Badge } from '@/components/atoms/badge';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import type { OfficeResponse } from '@/types/api/office.types';
import { Building2, Clock, Eye, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface OfficeTableProps {
  offices: OfficeResponse[];
  isDeleting: boolean;
  onDelete: (office: OfficeResponse) => void;
}

/**
 * OfficeTable — organism tabel daftar kantor (HR Admin).
 * Mendukung navigasi langsung ke detail (/hr_admin/offices/[id]),
 * edit (/hr_admin/offices/[id]/edit), dan aksi hapus dengan alert.
 */
export function OfficeTable({ offices, isDeleting, onDelete }: OfficeTableProps) {
  const router = useRouter();

  return (
    <DataTableCard
      title="Daftar Kantor"
      description={`${offices.length} kantor ditemukan`}
      columns={[
        { label: 'Nama Kantor' },
        { label: 'Departemen' },
        { label: 'Jadwal Presensi (WIB)' },
        { label: 'Alamat' },
        { label: 'Radius' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={offices.length === 0}
      emptyIcon={MapPin}
      emptyMessage="Belum ada kantor yang cocok dengan filter."
    >
      {offices.map((office) => {
        const setting = office.attendanceSetting;

        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: row navigation duplicates the Detail menu item
          <tr
            key={office.id}
            className="border-b transition-colors last:border-0 hover:bg-muted/40 cursor-pointer"
            onClick={() => router.push(`/hr_admin/offices/${office.id}`)}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground hover:underline">{office.name}</span>
              </div>
            </td>

            <td className="px-6 py-4">
              {office.departments.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">-</span>
              ) : (
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {office.departments.map((department) => (
                    <Badge key={department.id} variant="secondary" className="text-xs">
                      {department.code}
                    </Badge>
                  ))}
                </div>
              )}
            </td>

            <td className="px-6 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Clock className="size-3.5 text-primary" />
                  <span>
                    Batas: <strong>{setting?.lateAfter ?? '08:00'} WIB</strong>
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Masuk {setting?.checkInStart ?? '06:00'}–{setting?.checkInEnd ?? '10:00'} • Pulang{' '}
                  {setting?.checkOutStart ?? '16:00'}–{setting?.checkOutEnd ?? '20:00'}
                </span>
              </div>
            </td>

            <td className="max-w-xs truncate px-6 py-4 text-muted-foreground text-xs">
              {office.address || '-'}
            </td>

            <td className="px-6 py-4">
              <Badge variant="outline" className="font-mono text-xs">
                {office.radiusMeter} m
              </Badge>
            </td>

            {/* biome-ignore lint/a11y/useKeyWithClickEvents: stops row-navigation click from bubbling */}
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
              <RowActionsMenu
                label="Aksi Kantor"
                contentClassName="w-48"
                items={[
                  {
                    key: 'detail',
                    label: 'Lihat Detail',
                    icon: Eye,
                    href: `/hr_admin/offices/${office.id}`,
                  },
                  {
                    key: 'edit',
                    label: 'Edit Kantor & Jadwal',
                    icon: Pencil,
                    href: `/hr_admin/offices/${office.id}/edit`,
                  },
                  {
                    key: 'delete',
                    label: 'Hapus Kantor',
                    icon: Trash2,
                    variant: 'destructive',
                    disabled: isDeleting,
                    onSelect: () => onDelete(office),
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

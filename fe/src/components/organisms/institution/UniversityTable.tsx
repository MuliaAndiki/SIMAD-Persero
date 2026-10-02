import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import type { InstitutionResponse } from '@/types/api/institution.types';
import { Eye, GraduationCap, MapPin, Pencil, Trash2 } from 'lucide-react';

export interface UniversityTableProps {
  universities: InstitutionResponse[];
  onEdit?: (institution: InstitutionResponse) => void;
  onDelete?: (institution: InstitutionResponse) => void;
}

export function UniversityTable({
  universities,
  onEdit,
  onDelete,
}: UniversityTableProps) {
  return (
    <DataTableCard
      title="Daftar Universitas & Perguruan Tinggi"
      description={`${universities.length} institusi terdaftar`}
      columns={[
        { label: 'Nama Institusi' },
        { label: 'Akronim' },
        { label: 'Jenjang' },
        { label: 'Lokasi' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={universities.length === 0}
      emptyIcon={GraduationCap}
      emptyMessage="Belum ada universitas yang cocok dengan kata kunci pencarian."
    >
      {universities.map((item) => (
        <tr key={item.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
          <td className="px-6 py-4 font-medium text-foreground">
            <div className="flex items-center gap-3">
              {item.logo ? (
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20">
                  <img
                    src={item.logo as string}
                    alt={item.name || 'Logo'}
                    className="size-full object-contain p-0.5"
                  />
                </div>
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-primary/10">
                  <GraduationCap className="size-4 text-primary" />
                </div>
              )}
              <span>{item.name}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            {item.shortName ? (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {item.shortName}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </td>
          <td className="px-6 py-4 text-xs">
            {item.educationLevel?.name ? (
              <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                {item.educationLevel.name}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </td>
          <td className="px-6 py-4 text-muted-foreground">
            {item.city || item.province ? (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span>{[item.city, item.province].filter(Boolean).join(', ')}</span>
              </div>
            ) : (
              '-'
            )}
          </td>
          <td className="px-6 py-4 text-right">
            <RowActionsMenu
              items={[
                {
                  key: 'detail',
                  label: 'Lihat Detail',
                  icon: Eye,
                  href: `/hr_admin/universities/${item.id}`,
                },
                ...(onEdit
                  ? [
                      {
                        key: 'edit',
                        label: 'Edit Universitas',
                        icon: Pencil,
                        onSelect: () => onEdit(item),
                      },
                    ]
                  : []),
                ...(onDelete
                  ? [
                      {
                        key: 'delete',
                        label: 'Hapus Universitas',
                        icon: Trash2,
                        variant: 'destructive' as const,
                        onSelect: () => onDelete(item),
                      },
                    ]
                  : []),
              ]}
            />
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}

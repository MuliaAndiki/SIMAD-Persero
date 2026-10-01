'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import { TableEmptyState } from '@/components/organisms/table/TableEmptyState';
import type { QuotaItem } from '@/types/api/quota.types';
import { Building2, Edit, Eye, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface QuotaTableProps {
  quotas: QuotaItem[];
  onDelete: (quota: QuotaItem) => void;
  onToggleActive?: (quota: QuotaItem) => void;
}

export function QuotaTable({ quotas, onDelete }: QuotaTableProps) {
  const router = useRouter();

  if (quotas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 bg-muted/10">
        <TableEmptyState
          icon={Users}
          title="Belum ada data kuota kantor"
          message="Belum ada master kuota magang yang ditambahkan. Klik tombol di bawah untuk membuat kuota baru."
          action={
            <Button asChild className="gap-2 mt-2">
              <Link href="/hr_admin/quotas/create">
                <Plus className="size-4" />
                Tambah Kuota Kantor
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Lokasi Kantor</TableHead>
            <TableHead className="font-semibold text-center">Total Kapasitas Kantor</TableHead>
            <TableHead className="font-semibold">Alokasi Per Departemen</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotas.map((quota) => {
            const allocations = quota.departmentAllocations || [];
            const totalAllocated = allocations.reduce((sum, a) => sum + (a.capacity || 0), 0);

            return (
              <TableRow
                key={quota.id}
                onClick={() => router.push(`/hr_admin/quotas/${quota.id}`)}
                className="hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block hover:underline">
                        {quota.officeLocation?.name ?? '-'}
                      </span>
                      {quota.officeLocation?.address && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {quota.officeLocation.address}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <Badge
                      variant="default"
                      className="font-mono text-xs px-2.5 py-0.5 bg-primary/90"
                    >
                      {quota.totalCapacity} Peserta
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Teralokasi: {totalAllocated}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {allocations.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      Belum dibagi ke departemen
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                      {allocations.map((alloc) => (
                        <Badge
                          key={alloc.departmentId || alloc.id}
                          variant="secondary"
                          className="text-xs font-normal py-0.5 px-2 bg-muted/60 border"
                        >
                          <span className="font-medium mr-1">
                            {alloc.department?.code ?? alloc.department?.name ?? 'Dept'}:
                          </span>
                          <strong className="text-foreground">{alloc.capacity}</strong>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge active={quota.isActive} />
                </TableCell>

                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    items={[
                      {
                        key: 'detail',
                        label: 'Lihat Detail',
                        icon: Eye,
                        href: `/hr_admin/quotas/${quota.id}`,
                      },
                      {
                        key: 'edit',
                        label: 'Edit Kuota',
                        icon: Edit,
                        href: `/hr_admin/quotas/${quota.id}/edit`,
                      },
                      {
                        key: 'delete',
                        label: 'Hapus Kuota',
                        icon: Trash2,
                        variant: 'destructive',
                        onSelect: () => onDelete(quota),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

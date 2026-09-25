'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import type { QuotaItem } from '@/types/api/quota.types';
import { Building2, Edit, Eye, MapPin, Plus, Trash2, Users } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed p-8 bg-muted/10">
        <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Belum ada data kuota kantor</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
          Belum ada master kuota magang yang ditambahkan. Klik tombol di bawah untuk membuat kuota baru.
        </p>
        <Button asChild className="gap-2">
          <Link href="/hr_admin/quotas/create">
            <Plus className="size-4" />
            Tambah Kuota Kantor
          </Link>
        </Button>
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
                    <Badge variant="default" className="font-mono text-xs px-2.5 py-0.5 bg-primary/90">
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
                          <span className="font-medium mr-1">{alloc.department?.code ?? alloc.department?.name ?? 'Dept'}:</span>
                          <strong className="text-foreground">{alloc.capacity}</strong>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  {quota.isActive ? (
                    <Badge variant="default" className="bg-emerald-600/15 text-emerald-700 border-emerald-300 dark:border-emerald-800">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      Nonaktif
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                      title="Lihat Detail & Ketersediaan Slot"
                    >
                      <Link href={`/hr_admin/quotas/${quota.id}`}>
                        <Eye className="size-4 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Detail</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                      title="Edit Kuota"
                    >
                      <Link href={`/hr_admin/quotas/${quota.id}/edit`}>
                        <Edit className="size-4 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(quota)}
                      title="Hapus Kuota"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

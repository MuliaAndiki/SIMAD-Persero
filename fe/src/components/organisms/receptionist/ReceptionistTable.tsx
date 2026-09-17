'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { OfficeResponse } from '@/types/api/office.types';
import type { ReceptionistResponse } from '@/types/api/receptionist.types';
import type { AlertContexType } from '@/types/ui';
import { Building2, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';

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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Resepsionis</CardTitle>
        <CardDescription>
          {total != null
            ? `${total} resepsionis terdaftar`
            : `${receptionists.length} resepsionis ditemukan`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {receptionists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <UserCog className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada resepsionis yang terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nama</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Kantor Penugasan</th>
                  <th className="px-6 py-3 font-medium">Cakupan Akses</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {receptionists.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
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
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          alert.confirm({
                            title: 'Hapus Resepsionis?',
                            deskripsi: 'Akun ini akan dinonaktifkan dan tidak bisa login kembali.',
                            icon: 'question',
                            confirmButtonText: 'Hapus',
                            onConfirm: () => onDelete(item.id),
                          })
                        }
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && onPageChange && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t px-6 py-3 text-xs text-muted-foreground">
            <span>
              Halaman {page} dari {totalPages} {total != null ? `(${total} resepsionis)` : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="h-8 gap-1 text-xs"
              >
                Selanjutnya
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { AlertContexType } from '@/types/ui';
import { Building2, Pencil, Trash2 } from 'lucide-react';

export interface DepartmentTableProps {
  departments: DepartmentResponse[];
  isDeleting: boolean;
  onOpenEdit: (department: DepartmentResponse) => void;
  onToggleActive: (department: DepartmentResponse) => void;
  onDelete: (id: string) => void;
  alert: AlertContexType;
}

/**
 * DepartmentTable — organism tabel daftar departemen (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function DepartmentTable({
  departments,
  isDeleting,
  onOpenEdit,
  onToggleActive,
  onDelete,
  alert,
}: DepartmentTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Departemen</CardTitle>
        <CardDescription>{departments.length} departemen ditemukan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Building2 className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada departemen yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Kode</th>
                  <th className="px-6 py-3 font-medium">Nama</th>
                  <th className="px-6 py-3 font-medium">Deskripsi</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
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
                      <Badge variant={department.isActive ? 'default' : 'secondary'}>
                        {department.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenEdit(department)}>
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => onToggleActive(department)}
                        >
                          {department.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() =>
                            alert.confirm({
                              title: 'Hapus Departemen?',
                              deskripsi: 'Apakah Anda yakin ingin menghapus departemen ini?',
                              icon: 'question',
                              confirmButtonText: 'Hapus',
                              onConfirm: () => {
                                onDelete(department.id);
                              },
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

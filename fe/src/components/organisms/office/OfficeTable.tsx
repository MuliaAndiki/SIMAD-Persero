'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import { MapPin, Pencil, Trash2 } from 'lucide-react';

export interface OfficeTableProps {
  offices: OfficeResponse[];
  departments: DepartmentResponse[];
  isDeleting: boolean;
  onOpenEdit: (office: OfficeResponse) => void;
  onDelete: (id: string) => void;
}

/**
 * OfficeTable — organism tabel daftar kantor (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function OfficeTable({
  offices,
  departments,
  isDeleting,
  onOpenEdit,
  onDelete,
}: OfficeTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Kantor</CardTitle>
        <CardDescription>{offices.length} kantor ditemukan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {offices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <MapPin className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada kantor yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nama</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Alamat</th>
                  <th className="px-6 py-3 font-medium">Radius</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => {
                  const department = departments.find((d) => d.id === office.departmentId);
                  return (
                    <tr
                      key={office.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-6 py-4 font-medium">{office.name}</td>
                      <td className="px-6 py-4">{department?.name ?? '-'}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
                        {office.address}
                      </td>
                      <td className="px-6 py-4">{office.radiusMeter} m</td>
                      <td className="px-6 py-4">
                        <Badge variant={office.isActive ? 'default' : 'secondary'}>
                          {office.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onOpenEdit(office)}>
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isDeleting}
                            onClick={() => onDelete(office.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import type { DepartmentResponse } from '@/types/api/department.types';
import { Building2, MoreHorizontal, Pencil, Power } from 'lucide-react';

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
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onOpenEdit(department)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleActive(department)}>
                            <Power className="size-4" />
                            {department.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

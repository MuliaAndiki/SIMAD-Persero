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
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import type { AlertContexType } from '@/types/ui';
import { Briefcase, Building2, Eye, MoreHorizontal, Trash, UserCheck } from 'lucide-react';

export interface SupervisorTableProps {
  supervisors: SupervisorResponse[];
  offices?: OfficeResponse[];
  departments?: DepartmentResponse[];
  onSelectSupervisor: (id: string) => void;
  onEditSupervisor?: (id: string) => void;
  onDeleteSupervisor?: (id: string) => void;
  onViewAuditLog?: (userId: string, userName: string) => void;
  alert: AlertContexType;
}

/**
 * SupervisorTable — organism tabel daftar supervisor (HR Admin).
 */
export function SupervisorTable({
  supervisors,
  offices,
  departments,
  onEditSupervisor,
  onDeleteSupervisor,
  onViewAuditLog,
  alert,
}: SupervisorTableProps) {
  const getOfficeName = (supervisor: SupervisorResponse) => {
    if (supervisor.officeLocation?.name) return supervisor.officeLocation.name;
    if (supervisor.officeId && offices) {
      const found = offices.find((o) => o.id === supervisor.officeId);
      if (found) return found.name;
    }
    return '-';
  };

  const getDeptName = (supervisor: SupervisorResponse) => {
    if (supervisor.department?.name) return supervisor.department.name;
    if (supervisor.departmentId && departments) {
      const found = departments.find((d) => d.id === supervisor.departmentId);
      if (found) return found.name;
    }
    return '-';
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Supervisor</CardTitle>
        <CardDescription>{supervisors.length} supervisor ditemukan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {supervisors.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <UserCheck className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada supervisor yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nama</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Kantor</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Bimbingan Aktif</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="">
                {supervisors.map((supervisor) => (
                  <tr
                    key={supervisor.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium">{supervisor.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{supervisor.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{getOfficeName(supervisor)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{getDeptName(supervisor)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={supervisor.isActive ? 'default' : 'secondary'}>
                        {supervisor.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{supervisor.activeAssignmentsCount}</td>

                    <td className="flex justify-center ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className="mt-2">
                          <Button variant="outline" size="sm" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Opsi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onViewAuditLog && supervisor.id && (
                            <DropdownMenuItem
                              onClick={() => onViewAuditLog(supervisor.id!, supervisor.fullName)}
                            >
                              <h1 className="font-semibold">History</h1>
                            </DropdownMenuItem>
                          )}
                          {onDeleteSupervisor && (
                            <DropdownMenuItem onClick={() => onEditSupervisor!(supervisor.id)}>
                              <h1 className="font-semibold ">Edit</h1>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            variant="default"
                            onClick={() => onDeleteSupervisor!(supervisor.id)}
                          >
                            <Eye className="size-4" />
                            <span className="font-semibold">Detail</span>
                          </DropdownMenuItem>
                          {onDeleteSupervisor && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                alert.confirm({
                                  title: 'Hapus',
                                  deskripsi: 'Apakah Kamu Ingin Menghapus Supervisor Ini?',
                                  icon: 'question',
                                  onConfirm: () => {
                                    onDeleteSupervisor(supervisor.id);
                                  },
                                })
                              }
                            >
                              <Trash />
                              <h1 className="font-semibold ">Hapus</h1>
                            </DropdownMenuItem>
                          )}
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

'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { OfficeResponse } from '@/types/api/office.types';
import type { ReceptionistResponse } from '@/types/api/receptionist.types';
import type { AlertContexType } from '@/types/ui';
import { UserCog } from 'lucide-react';

export interface ReceptionistTableProps {
  receptionists: ReceptionistResponse[];
  offices: OfficeResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  alert: AlertContexType;
}

export function ReceptionistTable({
  receptionists,
  offices,
  onEdit,
  onDelete,
  alert,
}: ReceptionistTableProps) {
  const getOfficeName = (officeId: string | null) => {
    if (!officeId) return '-';
    return offices.find((o) => o.id === officeId)?.name ?? '-';
  };

  const getDeptName = (deptId: string | null, officeId: string | null) => {
    if (!deptId || !officeId) return '-';
    const office = offices.find((o) => o.id === officeId);
    return office?.departments?.find((d) => d.id === deptId)?.name ?? '-';
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Resepsionis</CardTitle>
        <CardDescription>{receptionists.length} resepsionis ditemukan</CardDescription>
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
                  <th className="px-6 py-3 font-medium">Kantor</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
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
                    <td className="px-6 py-4">{getOfficeName(item.officeId)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {getDeptName(item.departmentId, item.officeId)}
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
      </CardContent>
    </Card>
  );
}

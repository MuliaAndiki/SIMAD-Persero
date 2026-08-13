'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import { Eye, UserCheck } from 'lucide-react';

export interface SupervisorTableProps {
  supervisors: SupervisorResponse[];
  onSelectSupervisor: (id: string) => void;
}

/**
 * SupervisorTable — organism tabel daftar supervisor (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function SupervisorTable({ supervisors, onSelectSupervisor }: SupervisorTableProps) {
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
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Bimbingan Aktif</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((supervisor) => (
                  <tr
                    key={supervisor.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium">{supervisor.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{supervisor.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={supervisor.isActive ? 'default' : 'secondary'}>
                        {supervisor.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{supervisor.activeAssignmentsCount}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectSupervisor(supervisor.id)}
                      >
                        <Eye className="size-4" />
                        Detail
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

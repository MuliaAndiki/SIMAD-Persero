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
import type { OfficeResponse } from '@/types/api/office.types';
import { Building2, Clock, Eye, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface OfficeTableProps {
  offices: OfficeResponse[];
  isDeleting: boolean;
  onDelete: (office: OfficeResponse) => void;
}

/**
 * OfficeTable — organism tabel daftar kantor (HR Admin).
 * Mendukung navigasi langsung ke detail (/hr_admin/offices/[id]),
 * edit (/hr_admin/offices/[id]/edit), dan aksi hapus dengan alert.
 */
export function OfficeTable({ offices, isDeleting, onDelete }: OfficeTableProps) {
  const router = useRouter();

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
                  <th className="px-6 py-3 font-medium">Nama Kantor</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Jadwal Presensi (WIB)</th>
                  <th className="px-6 py-3 font-medium">Alamat</th>
                  <th className="px-6 py-3 font-medium">Radius</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => {
                  const setting = office.attendanceSetting;

                  return (
                    <tr
                      key={office.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40 cursor-pointer"
                      onClick={() => router.push(`/hr_admin/offices/${office.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-primary shrink-0" />
                          <span className="font-semibold text-foreground hover:underline">
                            {office.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {office.departments.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {office.departments.map((department) => (
                              <Badge key={department.id} variant="secondary" className="text-xs">
                                {department.code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Clock className="size-3.5 text-primary" />
                            <span>
                              Batas: <strong>{setting?.lateAfter ?? '08:00'} WIB</strong>
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            Masuk {setting?.checkInStart ?? '06:00'}–{setting?.checkInEnd ?? '10:00'} • Pulang {setting?.checkOutStart ?? '16:00'}–{setting?.checkOutEnd ?? '20:00'}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-xs truncate px-6 py-4 text-muted-foreground text-xs">
                        {office.address || '-'}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {office.radiusMeter} m
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aksi Kantor</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/hr_admin/offices/${office.id}`}>
                                <Eye className="size-4 mr-2 text-primary" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/hr_admin/offices/${office.id}/edit`}>
                                <Pencil className="size-4 mr-2 text-muted-foreground" />
                                Edit Kantor & Jadwal
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(office)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              disabled={isDeleting}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Hapus Kantor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

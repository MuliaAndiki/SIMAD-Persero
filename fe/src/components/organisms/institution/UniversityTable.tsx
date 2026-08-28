'use client';

import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { InstitutionResponse } from '@/types/api/institution.types';
import type { AlertContexType } from '@/types/ui';
import { GraduationCap, MapPin, Pencil, Trash2 } from 'lucide-react';

export interface UniversityTableProps {
  universities: InstitutionResponse[];
  isDeleting: boolean;
  onOpenEdit: (university: InstitutionResponse) => void;
  onDelete: (id: string) => void;
  alert: AlertContexType;
}

export function UniversityTable({
  universities,
  isDeleting,
  onOpenEdit,
  onDelete,
  alert,
}: UniversityTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Universitas & Perguruan Tinggi</CardTitle>
        <CardDescription>{universities.length} institusi terdaftar</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {universities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <GraduationCap className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada universitas yang cocok dengan kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nama Institusi</th>
                  <th className="px-6 py-3 font-medium">Akronim</th>
                  <th className="px-6 py-3 font-medium">Jenjang</th>
                  <th className="px-6 py-3 font-medium">Lokasi</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {item.logo ? (
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20">
                            <img
                              src={item.logo as string}
                              alt={item.name || 'Logo'}
                              className="size-full object-contain p-0.5"
                            />
                          </div>
                        ) : (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-primary/10">
                            <GraduationCap className="size-4 text-primary" />
                          </div>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.shortName ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {item.shortName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {item.educationLevel?.name ? (
                        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                          {item.educationLevel.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.city || item.province ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                          <span>
                            {[item.city, item.province].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenEdit(item)}>
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() =>
                            alert.confirm({
                              title: 'Hapus Universitas?',
                              deskripsi: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
                              icon: 'question',
                              confirmButtonText: 'Hapus',
                              onConfirm: () => {
                                onDelete(item.id);
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

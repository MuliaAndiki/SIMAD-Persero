"use client";

import { MapPin, Pencil, Settings2, Trash2 } from "lucide-react";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import type { OfficeResponse } from "@/types/api/office.types";
import type { AlertContexType } from "@/types/ui";

export interface OfficeTableProps {
  offices: OfficeResponse[];
  isDeleting: boolean;
  onOpenEdit: (office: OfficeResponse) => void;
  onManageDepartments: (office: OfficeResponse) => void;

  alert: AlertContexType;
}

/**
 * OfficeTable — organism tabel daftar kantor (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 * Departemen ditampilkan sebagai badge karena satu kantor melayani
 * banyak departemen (many-to-many).
 */
export function OfficeTable({
  offices,
  isDeleting,
  onOpenEdit,
  onManageDepartments,

  alert,
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
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => (
                  <tr
                    key={office.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium">{office.name}</td>
                    <td className="px-6 py-4">
                      {office.departments.length === 0 ? (
                        "-"
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {office.departments.map((department) => (
                            <Badge key={department.id} variant="secondary">
                              {department.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
                      {office.address}
                    </td>
                    <td className="px-6 py-4">{office.radiusMeter} m</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageDepartments(office)}
                        >
                          <Settings2 className="size-4" />
                          Departemen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenEdit(office)}
                        >
                          <Pencil className="size-4" />
                          Edit
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

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { InternshipStatusBadge } from "@/components/organisms/internship/InternshipStatusBadge";
import type { InternshipResponse } from "@/types/api/internship.types";
import { formatDate } from "@/utils/string.format";
import { Users } from "lucide-react";

export interface InternshipsTableProps {
  internships: InternshipResponse[];
}

/**
 * InternshipsTable — organism tabel daftar magang (HR Admin).
 * Presentasi murni (monitoring); transisi ONBOARDING_COMPLETED → ACTIVE
 * ditangani otomatis oleh scheduled job saat tanggal mulai tiba, sehingga
 * tidak ada aksi manual di tabel ini.
 */
export function InternshipsTable({ internships }: InternshipsTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Magang</CardTitle>
        <CardDescription>{internships.length} magang ditemukan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {internships.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Users className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada magang yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Peserta</th>
                  <th className="px-6 py-3 font-medium">Instansi</th>
                  <th className="px-6 py-3 font-medium">Jurusan</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Supervisor</th>
                  <th className="px-6 py-3 font-medium">Periode</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((internship) => {
                  const supervisor =
                    internship.supervisorAssignments?.[0]?.supervisor
                      ?.fullName ?? "-";

                  return (
                    <tr
                      key={internship.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {internship.internProfile?.user.fullName ?? "-"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {internship.internProfile?.studentNumber ||
                              internship.internProfile?.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {internship.internProfile?.institution?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        {internship.internProfile?.major?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        {internship.department?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">{supervisor}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatDate(internship.actualStartDate)}</span>
                          <span className="text-xs text-muted-foreground">
                            s.d. {formatDate(internship.actualEndDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <InternshipStatusBadge status={internship.status} />
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

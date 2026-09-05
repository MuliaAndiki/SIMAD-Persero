"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { InternshipStatusBadge } from "@/components/organisms/internship/InternshipStatusBadge";
import type { InternshipResponse } from "@/types/api/internship.types";
import { formatDate } from "@/utils/string.format";
import {
  Archive,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Play,
  UserCheck,
  Users,
} from "lucide-react";

export interface InternshipsTableProps {
  internships: InternshipResponse[];
  onStart?: (id: string) => void;
  onFinish?: (id: string) => void;
  onOpenExtend?: (internship: InternshipResponse) => void;
  onOpenChangeDept?: (internship: InternshipResponse) => void;
  onOpenAssignSupervisor?: (internship: InternshipResponse) => void;
  onOpenGenerateCert?: (internship: InternshipResponse) => void;
  onArchive?: (id: string) => void;
}

/**
 * InternshipsTable — organism tabel daftar magang & pusat kontrol (HR Admin).
 */
export function InternshipsTable({
  internships,
  onStart,
  onFinish,
  onOpenExtend,
  onOpenChangeDept,
  onOpenAssignSupervisor,
  onOpenGenerateCert,
  onArchive,
}: InternshipsTableProps) {
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
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
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
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Aksi Magang</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {(internship.status === "ONBOARDING_COMPLETED" ||
                              internship.status === "ONBOARDING_PENDING") &&
                              onStart && (
                                <DropdownMenuItem
                                  onClick={() => onStart(internship.id)}
                                >
                                  <Play className="mr-2 size-4 text-emerald-500" />
                                  Mulai Magang
                                </DropdownMenuItem>
                              )}

                            {internship.status === "ACTIVE" && onFinish && (
                              <DropdownMenuItem
                                onClick={() => onFinish(internship.id)}
                              >
                                <CheckCircle2 className="mr-2 size-4 text-blue-500" />
                                Selesaikan Magang
                              </DropdownMenuItem>
                            )}

                            {internship.status === "COMPLETED" &&
                              onOpenGenerateCert && (
                                <DropdownMenuItem
                                  onClick={() => onOpenGenerateCert(internship)}
                                  className="text-primary font-medium"
                                >
                                  <Award className="mr-2 size-4" />
                                  Terbitkan Sertifikat
                                </DropdownMenuItem>
                              )}

                            {onOpenExtend && (
                              <DropdownMenuItem
                                onClick={() => onOpenExtend(internship)}
                              >
                                <Calendar className="mr-2 size-4" />
                                Perpanjang Magang
                              </DropdownMenuItem>
                            )}

                            {onOpenChangeDept && (
                              <DropdownMenuItem
                                onClick={() => onOpenChangeDept(internship)}
                              >
                                <Building2 className="mr-2 size-4" />
                                Pindahkan Departemen
                              </DropdownMenuItem>
                            )}

                            {onOpenAssignSupervisor && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onOpenAssignSupervisor(internship)
                                }
                              >
                                <UserCheck className="mr-2 size-4" />
                                Tugaskan Supervisor
                              </DropdownMenuItem>
                            )}

                            {(internship.status === "COMPLETED" ||
                              internship.status === "CERTIFICATE_GENERATED") &&
                              onArchive && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onArchive(internship.id)}
                                    className="text-amber-600"
                                  >
                                    <Archive className="mr-2 size-4" />
                                    Arsipkan
                                  </DropdownMenuItem>
                                </>
                              )}
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

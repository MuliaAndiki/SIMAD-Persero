"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { ApplicationStatusBadge } from "@/components/organisms/application/ApplicationStatusBadge";
import { REVIEWABLE_STATUSES } from "@/components/organisms/application/ApplicationReviewDetail";
import type {
  ApplicationResponse,
  ApplicationStatusValue,
} from "@/types/api/application.types";
import { formatDate } from "@/utils/string.format";
import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react";

export interface ApplicationTableProps {
  applications: ApplicationResponse[];
  onSelectApplication: (id: string) => void;
  onApprove: (app: ApplicationResponse) => void;
  onReject: (app: ApplicationResponse) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

/**
 * ApplicationTable — organism tabel daftar pengajuan magang (HR Admin).
 * Presentasi murni; data & handler disuplai container/section.
 */
export function ApplicationTable({
  applications,
  onSelectApplication,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ApplicationTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Pengajuan</CardTitle>
        <CardDescription>
          {applications.length} pengajuan ditemukan
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <FileText className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada pengajuan yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">No. Pengajuan</th>
                  <th className="px-6 py-3 font-medium">Peserta</th>
                  <th className="px-6 py-3 font-medium">Periode</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium">
                      {app.applicationNumber ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {app.internProfile?.user.fullName ?? "-"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {app.internProfile?.studentNumber ||
                            app.internProfile?.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span>{formatDate(app.requestedStartDate)}</span>
                        <span className="text-xs text-muted-foreground">
                          s.d. {formatDate(app.requestedEndDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {REVIEWABLE_STATUSES.includes(
                          app.status as ApplicationStatusValue,
                        ) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReject(app)}
                              disabled={isApproving || isRejecting}
                            >
                              <XCircle className="size-4" />
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onApprove(app)}
                              disabled={isApproving || isRejecting}
                            >
                              <CheckCircle2 className="size-4" />
                              Setujui
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectApplication(app.id)}
                        >
                          <Eye className="size-4" />
                          Review
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

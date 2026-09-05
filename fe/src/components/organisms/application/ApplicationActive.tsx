import { ApplicationSectionService } from "@/components/page/application/ApplicationSection";
import { ApplicationResponse } from "@/types/api/application.types";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  CalendarCheck,
  CalendarClock,
  Edit,
  FileText,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { formatDate } from "@/utils/string.format";
import { Button } from "@/components/atoms";
import EditDraftForm from "./ApplicationEditForm";

interface ApplicationStatusCardProps {
  app: ApplicationResponse;
  service: ApplicationSectionService;
  isSubmitting: boolean;
}
const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({
  app,
  service,
  isSubmitting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isDraft = app.status === "DRAFT";
  const isTerminal = app.status === "APPROVED" || app.status === "REJECTED";

  // Jika sedang edit dan status adalah DRAFT, tampilkan form edit
  if (isDraft && isEditing) {
    return (
      <EditDraftForm
        app={app}
        service={service}
        isSubmitting={isSubmitting}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Pengajuan Aktif</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <FileText className="size-3.5" />
            {app.applicationNumber ?? "Belum ada nomor pengajuan"}
          </CardDescription>
        </div>
        <ApplicationStatusBadge status={app.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <CalendarCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Tanggal Mulai
              </span>
              <span className="text-sm font-medium">
                {formatDate(app.requestedStartDate)}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Tanggal Selesai
              </span>
              <span className="text-sm font-medium">
                {formatDate(app.requestedEndDate)}
              </span>
            </div>
          </div>
        </div>

        {app.motivation && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Motivasi
            </span>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              {app.motivation}
            </p>
          </div>
        )}

        {app.introductionLetterFile && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <FileText className="size-4 shrink-0 text-primary" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">
                {app.introductionLetterFile.originalName}
              </span>
              <span className="text-xs text-muted-foreground">
                Surat pengantar
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                service.onPreviewFile?.(app.introductionLetterFile!.url)
              }
            >
              Lihat PDF
            </Button>
          </div>
        )}

        {app.status === "REJECTED" && app.rejectionReason && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-destructive">
                Alasan Penolakan
              </span>
              <p className="text-sm text-destructive/90">
                {app.rejectionReason}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
          {isDraft && (
            <>
              <Button
                onClick={() => service.onSubmitDraft(app.id)}
                disabled={isSubmitting}
              >
                <Send className="size-4" />
                {isSubmitting ? "Mengirim…" : "Kirim Pengajuan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
              >
                <Edit className="size-4" />
                Edit Draft
              </Button>
              <Button
                variant="destructive"
                onClick={() => service.onDeleteDraft(app.id)}
                disabled={isSubmitting}
              >
                {!isSubmitting ? (
                  <div className="flex items-center justify-center gap-1">
                    <Trash2 className="size-4" />
                    Hapus Draf
                  </div>
                ) : (
                  <div>Loading...</div>
                )}
              </Button>
            </>
          )}
          {!isDraft && !isTerminal && (
            <Button
              variant="outline"
              onClick={() => service.onCancel(app.id)}
              disabled={isSubmitting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="size-4" />
              Batalkan Pengajuan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusCard;

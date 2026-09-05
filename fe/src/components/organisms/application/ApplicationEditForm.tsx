import { ApplicationSectionService } from "@/components/page/application/ApplicationSection";
import {
  ApplicationResponse,
  UpdateApplicationBody,
} from "@/types/api/application.types";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { AlertCircle, FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/atoms";
import { cn } from "@/utils/classname";
import { Input } from "@/components/atoms";

interface EditDraftFormProps {
  app: ApplicationResponse;
  service: ApplicationSectionService;
  isSubmitting: boolean;
  onCancel: () => void;
}
const EditDraftForm: React.FC<EditDraftFormProps> = ({
  app,
  service,
  isSubmitting,
  onCancel,
}) => {
  // Initialize dengan data dari app yang ada
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState(
    app.requestedStartDate
      ? new Date(app.requestedStartDate).toISOString().split("T")[0]
      : "",
  );
  const [endDate, setEndDate] = useState(
    app.requestedEndDate
      ? new Date(app.requestedEndDate).toISOString().split("T")[0]
      : "",
  );
  const [motivation, setMotivation] = useState(app.motivation ?? "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [willChangeFile, setWillChangeFile] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > 5 * 1024 * 1024) {
      setLocalError("Ukuran file maksimal 5MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
    setWillChangeFile(!!selected);
    setLocalError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!startDate || !endDate) {
      setLocalError("Tanggal mulai dan selesai harus diisi.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setLocalError("Tanggal mulai harus sebelum tanggal selesai.");
      return;
    }

    const updateData: UpdateApplicationBody = {
      requestedStartDate: new Date(startDate).toISOString(),
      requestedEndDate: new Date(endDate).toISOString(),
      motivation: motivation.trim() || undefined,
    };

    // Jika ada file baru, upload dulu
    if (file) {
      const upload = await service.onUploadFile(file);
      if (!upload) {
        setLocalError("Gagal mengunggah file baru");
        return;
      }
      updateData.coverLetterFileId = upload.fileId;
    }

    await service.onUpdateDraft(app.id, updateData);
    onCancel(); // Kembali ke view mode
  };

  const fieldClass =
    "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Draft Pengajuan</CardTitle>
        <CardDescription>
          Perbarui informasi pengajuan magang Anda sebelum mengirimkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-startDate" className="text-sm font-medium">
                Tanggal Mulai *
              </label>
              <Input
                id="edit-startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-endDate" className="text-sm font-medium">
                Tanggal Selesai *
              </label>
              <Input
                id="edit-endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-motivation" className="text-sm font-medium">
              Motivasi <span className="text-muted-foreground">(opsional)</span>
            </label>
            <textarea
              id="edit-motivation"
              rows={4}
              placeholder="Ceritakan alasan dan tujuan Anda mengikuti magang…"
              className={cn(fieldClass, "h-auto py-2")}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
            />
          </div>

          {/* File yang sudah ada */}
          {app.introductionLetterFile && !willChangeFile && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                Surat Pengantar Saat Ini
              </span>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="size-4 shrink-0 text-primary" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {app.introductionLetterFile.originalName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    File saat ini
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    service.onPreviewFile?.(app.introductionLetterFile!.url)
                  }
                >
                  Lihat
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWillChangeFile(true)}
                className="self-start"
              >
                Ganti File
              </Button>
            </div>
          )}

          {/* Upload file baru */}
          {willChangeFile && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                Unggah Surat Pengantar Baru (PDF, maks 5MB)
              </span>
              <label
                htmlFor="edit-coverLetter"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <UploadCloud className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {file ? file.name : "Klik untuk memilih file baru"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file
                    ? "File baru siap diunggah"
                    : "Unggah surat pengantar baru dalam format PDF"}
                </span>
                <input
                  id="edit-coverLetter"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setWillChangeFile(false);
                  setFile(null);
                }}
                className="self-start"
              >
                Batal Ganti File
              </Button>
            </div>
          )}

          {localError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {localError}
            </div>
          )}

          <div className="flex gap-3 justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDraftForm;

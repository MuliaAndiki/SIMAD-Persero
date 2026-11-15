import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { TableLoader } from "@/components/atoms/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { RowActionsMenu } from "@/components/organisms/table/RowActionsMenu";
import { StatusBadge } from "@/components/organisms/table/StatusBadge";
import { TableEmptyState } from "@/components/organisms/table/TableEmptyState";
import type { GuideItem } from "@/types/api/guide.types";
import {
  AlertCircle,
  BookOpen,
  Edit2,
  Eye,
  EyeOff,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";

export interface GuidesManagementSectionProps {
  guides: GuideItem[];
  isLoading: boolean;
  deletingId: string | null;
  togglingId: string | null;
  onOpenCreate: () => void;
  onOpenEdit: (guide: GuideItem) => void;
  onOpenDetail: (guide: GuideItem) => void;
  onToggleStatus: (guide: GuideItem) => void;
  onDelete: (guide: GuideItem) => void;
}

function getCategoryBadge(category: string) {
  switch (category) {
    case "ONBOARDING":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          Orientasi
        </Badge>
      );
    case "ATTENDANCE":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          Presensi
        </Badge>
      );
    case "LOGBOOK":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        >
          Jurnal
        </Badge>
      );
    case "FINAL_REPORT":
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
        >
          Laporan Akhir
        </Badge>
      );
    case "CERTIFICATE":
      return (
        <Badge
          variant="secondary"
          className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
        >
          Sertifikat
        </Badge>
      );
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
}

export function GuidesManagementSection({
  guides = [],
  isLoading,
  deletingId,
  togglingId,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onToggleStatus,
  onDelete,
}: GuidesManagementSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Panduan & Video Tutorial
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola konten petunjuk operasional, orientasi, dan video tutorial
            untuk peserta magang.
          </p>
        </div>
        <Button
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Tambah Panduan
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            Daftar Materi Panduan ({guides.length})
          </CardTitle>
          <CardDescription>
            Urutan tampilan materi disesuaikan dengan nomor urut display order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableLoader label="Memuat data panduan..." />
          ) : guides.length === 0 ? (
            <TableEmptyState
              icon={AlertCircle}
              title="Tidak ada panduan yang ditemukan."
              message="Klik tombol Tambah Panduan untuk membuat materi baru."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-y">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Urutan</th>
                    <th className="px-4 py-3">Judul Panduan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-center">Video</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Diperbarui</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guides.map((guide) => (
                    <tr
                      key={guide.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-semibold text-muted-foreground">
                        {guide.displayOrder ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {guide.title}
                        </div>
                        {guide.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {guide.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getCategoryBadge(guide.category)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {guide.videoUrl ? (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-600 border-red-500/20 text-xs gap-1"
                          >
                            <PlayCircle className="size-3" /> Ada Video
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={guide.isPublished ? "PUBLISHED" : "DRAFT"}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(guide.updatedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RowActionsMenu
                          items={[
                            {
                              key: "preview",
                              label: "Lihat Detail Panduan",
                              icon: Eye,
                              onSelect: () => onOpenDetail(guide),
                            },
                            {
                              key: "edit",
                              label: "Edit Panduan",
                              icon: Edit2,
                              onSelect: () => onOpenEdit(guide),
                            },
                            {
                              key: "toggle-status",
                              label:
                                togglingId === guide.id
                                  ? "Memproses..."
                                  : guide.isPublished
                                    ? "Arsipkan (Jadikan Draf)"
                                    : "Terbitkan",
                              icon: guide.isPublished ? EyeOff : Eye,
                              disabled: togglingId === guide.id,
                              onSelect: () => onToggleStatus(guide),
                            },
                            {
                              key: "delete",
                              label:
                                deletingId === guide.id
                                  ? "Menghapus..."
                                  : "Hapus Panduan",
                              icon: Trash2,
                              variant: "destructive",
                              disabled: deletingId === guide.id,
                              onSelect: () => onDelete(guide),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

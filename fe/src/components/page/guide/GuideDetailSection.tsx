import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GuideVideoPlayer } from "@/components/organisms/guide/GuideVideoPlayer";
import type { GuideItem } from "@/types/api/guide.types";
import { getGuideCategoryLabel } from "@/utils/guide-category";
import { ArrowLeft, Calendar, Edit2, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

export interface GuideDetailSectionProps {
  guide: GuideItem;
  backHref: string;
  backLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

/**
 * Detail panduan lintas role (tanpa 'use client', tanpa state).
 * Semua aksi (edit/hapus) dioper dari container via props.
 */
export function GuideDetailSection({
  guide,
  backHref,
  backLabel = "Kembali ke daftar panduan",
  onEdit,
  onDelete,
  isDeleting = false,
}: GuideDetailSectionProps) {
  return (
    <section className="mx-auto flex w-full max-w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <Link href={backHref}>
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        </Button>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={onEdit}
              >
                <Edit2 className="size-3.5" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            <Sparkles className="mr-1 size-3 text-primary" />
            {getGuideCategoryLabel(guide.category)}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            Diperbarui: {new Date(guide.updatedAt).toLocaleDateString("id-ID")}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {guide.title}
        </h1>

        {guide.description && (
          <p className="text-sm text-muted-foreground">{guide.description}</p>
        )}
      </div>

      {guide.videoUrl && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Video Tutorial
          </span>
          <GuideVideoPlayer url={guide.videoUrl} title={guide.title} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Petunjuk Langkah & Penjelasan
        </span>
        <div className="whitespace-pre-wrap rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed">
          {guide.content}
        </div>
      </div>
    </section>
  );
}

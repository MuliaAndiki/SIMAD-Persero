"use client";

import { GuidesManagementSection } from "@/components/page/hr/GuidesManagementSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useApi } from "@/hooks/useService/useApi";
import type { GuideItem } from "@/types/api/guide.types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function HRGuidesContainer() {
  const api = useApi();
  const ns = useAppNameSpace();
  const router = useRouter();

  const guidesQuery = api.guide.query.list();
  const deleteMutation = api.guide.mutate.delete();
  const updateStatusMutation = api.guide.mutate.updateStatus();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const allGuides: GuideItem[] = Array.isArray(guidesQuery.data)
    ? guidesQuery.data
    : ((guidesQuery.data as any)?.data ?? []);

  const guides = useMemo(() => {
    return allGuides.sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  }, [allGuides]);

  const handleOpenCreate = () => {
    router.push("/hr_admin/guides/create");
  };

  const handleOpenEdit = (guide: GuideItem) => {
    router.push(`/hr_admin/guides/${guide.slug}/edit`);
  };

  const handleOpenDetail = (guide: GuideItem) => {
    router.push(`/hr_admin/guides/${guide.slug}`);
  };

  const handleToggleStatus = async (guide: GuideItem) => {
    try {
      setTogglingId(guide.id);
      await updateStatusMutation.mutateAsync({
        id: guide.id,
        body: { isPublished: !guide.isPublished },
      });
      toast.success(
        guide.isPublished
          ? "Panduan berhasil diarsipkan"
          : "Panduan berhasil diterbitkan",
      );
      guidesQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status panduan");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (guide: GuideItem) => {
    const confirmed = await ns.alert.confirm({
      title: "Hapus Panduan?",
      deskripsi: `Panduan "${guide.title}" akan dihapus permanen dan tidak tampil lagi ke peserta magang.`,
      confirmButtonText: "Ya, Hapus",
      icon: "warning",
    });
    if (!confirmed) return;

    try {
      setDeletingId(guide.id);
      await deleteMutation.mutateAsync(guide.id);
      toast.success("Panduan berhasil dihapus");
      guidesQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus panduan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <GuidesManagementSection
      guides={guides}
      isLoading={guidesQuery.isPending}
      deletingId={deletingId}
      togglingId={togglingId}
      onOpenCreate={handleOpenCreate}
      onOpenEdit={handleOpenEdit}
      onOpenDetail={handleOpenDetail}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  );
}

"use client";

import type {
  UniversityFormField,
  UniversityFormState,
} from "@/components/organisms/institution/UniversityFormDialog";
import { UniversityDetailSection } from "@/components/page/hr/UniversityDetailSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useApi } from "@/hooks/useService/useApi";
import type { InstitutionResponse } from "@/types/api/institution.types";
import { useCallback, useState } from "react";

const EMPTY_FORM: UniversityFormState = {
  name: "",
  shortName: "",
  educationLevelId: "",
  province: "",
  city: "",
  logo: "",
};

interface UniversityDetailContainerProps {
  id: string;
}

export default function UniversityDetailContainer({
  id,
}: UniversityDetailContainerProps) {
  const api = useApi();
  const ns = useAppNameSpace();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<UniversityFormState>(EMPTY_FORM);

  const detailQuery = api.institution.query.detail({ institutionId: id });
  const educationLevelsQuery = api.institution.query.educationLevels();

  const update = api.institution.mutate.update();
  const remove = api.institution.mutate.delete();

  const university = detailQuery.data ?? null;

  const handleFieldChange = useCallback(
    (field: UniversityFormField, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleOpenEdit = useCallback(() => {
    if (!university) return;
    setForm({
      name: university.name ?? "",
      shortName: university.shortName ?? "",
      educationLevelId: university.educationLevelId ?? "",
      province: university.province ?? "",
      city: university.city ?? "",
      logo: (university.logo as string | null | undefined) ?? "",
    });
    setFormOpen(true);
  }, [university]);

  const handleCloseForm = useCallback(() => {
    if (update.isPending) return;
    setFormOpen(false);
  }, [update.isPending]);

  const handleSubmit = useCallback(async () => {
    if (!university) return;
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim() || undefined,
      educationLevelId: form.educationLevelId || undefined,
      province: form.province.trim() || undefined,
      city: form.city.trim() || undefined,
      logo: form.logo.trim() || undefined,
    };

    await update.mutateAsync({
      params: { institutionId: university.id },
      body: payload,
    });
    setFormOpen(false);
    detailQuery.refetch();
  }, [detailQuery, form, university, update]);

  const handleDelete = useCallback(async () => {
    if (!university) return;
    await remove.mutateAsync({ institutionId: university.id });
    ns.router.back();
  }, [ns.router, remove, university]);

  return (
    <UniversityDetailSection
      state={{
        isPending: detailQuery.isPending,
        isError: detailQuery.isError,
        errorMessage: detailQuery.error?.message,
        university,
        educationLevels: educationLevelsQuery.data ?? [],
        formOpen,
        editing: university,
        form,
        isSaving: update.isPending,
        isDeleting: remove.isPending,
        alert: ns.alert,
      }}
      actions={{
        onOpenEdit: handleOpenEdit,
        onCloseForm: handleCloseForm,
        onFieldChange: handleFieldChange,
        onSubmit: handleSubmit,
        onDelete: handleDelete,
      }}
    />
  );
}

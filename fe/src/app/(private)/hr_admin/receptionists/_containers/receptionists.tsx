"use client";

import { useCallback, useEffect, useState } from "react";

import type { ReceptionistFormType } from "@/components/organisms/receptionist/ReceptionistFormDialog";
import { ReceptionistsSection } from "@/components/page/hr/ReceptionistsSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useDebounce } from "@/hooks/useDebounce";
import { useApi } from "@/hooks/useService/useApi";
import type {
  CreateReceptionistBody,
  UpdateReceptionistBody,
} from "@/types/api/receptionist.types";

export default function HrReceptionistsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ReceptionistFormType>({
    fullName: "",
    email: "",
    officeId: "",
    departmentId: "",
    password: "",
    isActive: true,
  });

  const debouncedKeyword = useDebounce(keyword, 1000);

  // ── Queries ──────────────────────────────────────────────────────────────
  const list = api.receptionist.query.list({
    keyword: debouncedKeyword || undefined,
    limit: 100,
  });

  const offices = api.office.query.list({ limit: 100 });

  const editingDetail = api.receptionist.query.detail(
    { receptionistId: editingId ?? "" },
    { enabled: Boolean(editingId) },
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = api.receptionist.mutate.create();
  const updateMutation = api.receptionist.mutate.update();
  const deleteMutation = api.receptionist.mutate.delete();

  // Populate form saat data detail editing selesai dimuat
  useEffect(() => {
    if (editingId && editingDetail.data) {
      setFormData({
        fullName: editingDetail.data.fullName,
        email: editingDetail.data.email,
        officeId: editingDetail.data.officeId ?? "",
        departmentId: editingDetail.data.departmentId ?? "",
        password: "",
        isActive: editingDetail.data.isActive,
      });
    }
  }, [editingDetail.data, editingId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormData({
      fullName: "",
      email: "",
      officeId: "",
      departmentId: "",
      password: "",
      isActive: true,
    });
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((id: string) => {
    setEditingId(id);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingId(null);
  }, []);

  const handleChangeForm = useCallback(
    (partial: Partial<ReceptionistFormType>) => {
      setFormData((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleSubmitForm = useCallback(async () => {
    if (editingId) {
      const body: UpdateReceptionistBody = {
        fullName: formData.fullName,
        email: formData.email,
        officeId: formData.officeId,
        departmentId: formData.departmentId,
        isActive: formData.isActive,
      };
      if (formData.password) body.password = formData.password;
      await updateMutation.mutateAsync({
        params: { receptionistId: editingId },
        body,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateReceptionistBody);
    }
    setFormOpen(false);
    setEditingId(null);
  }, [editingId, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync({ receptionistId: id });
    },
    [deleteMutation],
  );

  return (
    <ReceptionistsSection
      state={{
        isPending: list.isPending,
        isFetching: list.isFetching,
        isError: list.isError,
        errorMessage: list.error?.message,
        receptionists: list.data ?? [],
        offices: offices.data ?? [],
        keyword,
        formOpen,
        isSaving:
          createMutation.isPending ||
          updateMutation.isPending ||
          (Boolean(editingId) && editingDetail.isPending),
        editingData:
          editingId && editingDetail.data ? editingDetail.data : null,
        formData,
        alert: ns.alert,
      }}
      actions={{
        onKeywordChange: setKeyword,
        onOpenCreate: handleOpenCreate,
        onOpenEdit: handleOpenEdit,
        onCloseForm: handleCloseForm,
        onChangeForm: handleChangeForm,
        onSubmitForm: handleSubmitForm,
        onDelete: handleDelete,
      }}
    />
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

import type { SupervisorFormType } from "@/components/organisms/supervisor/SupervisorFormDialog";
import { SupervisorsSection } from "@/components/page/hr/SupervisorsSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useApi } from "@/hooks/useService/useApi";
import type {
  CreateSupervisorBody,
  UpdateSupervisorBody,
} from "@/types/api/supervisor.types";

/**
 * Container halaman Supervisor (HR Admin) — orchestration layer.
 *
 * Mengelola list supervisor (GET /supervisors), detail + assignment
 * (GET /supervisors/:id), assign intern (POST /supervisors/:id/assign),
 * dan lepas assignment (DELETE /supervisors/:id/assignments/:assignmentId).
 */
export default function HrSupervisorsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [internshipId, setInternshipId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SupervisorFormType>({
    fullName: "",
    email: "",
    officeId: "",
    departmentId: "",
    password: "",
    isActive: true,
  });

  const list = api.supervisor.query.list({
    keyword: keyword || undefined,
    limit: 100,
  });

  const detail = api.supervisor.query.detail(
    { supervisorId: selectedId ?? "" },
    { enabled: Boolean(selectedId) },
  );

  const editingDetail = api.supervisor.query.detail(
    { supervisorId: editingId ?? "" },
    { enabled: Boolean(editingId) },
  );

  const approvedApplications = api.application.query.list({
    status: "APPROVED",
    limit: 100,
  });

  const departments = api.department.query.list({});
  const offices = api.office.query.list({ limit: 100 });

  const assign = api.supervisor.mutate.assign();
  const removeAssignment = api.supervisor.mutate.removeAssignment();
  const createSupervisor = api.supervisor.mutate.create();
  const updateSupervisor = api.supervisor.mutate.update();
  const deleteSupervisor = api.supervisor.mutate.delete();

  useEffect(() => {
    if (editingId && editingDetail.data) {
      const departmentId = editingDetail.data.departmentId ?? "";
      const officeId =
        offices.data?.find((o) =>
          o.departments.some((d) => d.id === departmentId),
        )?.id ?? "";
      setFormData({
        fullName: editingDetail.data.fullName,
        email: editingDetail.data.email,
        officeId,
        departmentId,
        password: "",
        isActive: editingDetail.data.isActive,
      });
    }
  }, [editingDetail.data, editingId, offices.data]);

  const handleOpenAssign = useCallback(() => {
    setInternshipId("");
    setAssignOpen(true);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setInternshipId("");
    setAssignOpen(false);
  }, []);

  const handleSubmitAssign = useCallback(async () => {
    if (!selectedId || !internshipId) return;
    await assign.mutateAsync({
      params: { supervisorId: selectedId },
      body: { internshipId },
    });
    setAssignOpen(false);
    setInternshipId("");
  }, [assign, internshipId, selectedId]);

  const handleRemoveAssignment = useCallback(
    async (assignmentId: string) => {
      if (!selectedId) return;
      const confirmed = await ns.alert.confirm({
        title: "Lepas Penugasan?",
        icon: "question",
        deskripsi:
          "Intern akan dilepas dari bimbingan supervisor ini. Supervisor dapat di-assign ulang kapan saja.",
        confirmButtonText: "Lepas",
      });
      if (!confirmed) return;
      await removeAssignment.mutateAsync({
        supervisorId: selectedId,
        assignmentId,
      });
    },
    [ns.alert, removeAssignment, selectedId],
  );

  const handleOpenCreateForm = useCallback(() => {
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

  const handleOpenEditForm = useCallback((id: string) => {
    setEditingId(id);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingId(null);
  }, []);

  const handleChangeForm = useCallback(
    (partial: Partial<SupervisorFormType>) => {
      setFormData((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleSubmitForm = useCallback(async () => {
    // Hanya field CreateSupervisorBody yang dikirim — officeId hanya dipakai
    // untuk memfilter departemen di UI, bukan sebagai payload.
    const createBody: CreateSupervisorBody = {
      fullName: formData.fullName,
      email: formData.email,
      departmentId: formData.departmentId,
    };
    if (formData.password) {
      createBody.password = formData.password;
    }

    if (editingId) {
      const updateBody: UpdateSupervisorBody = {
        fullName: formData.fullName,
        email: formData.email,
        departmentId: formData.departmentId,
        isActive: formData.isActive,
      };
      if (formData.password) {
        updateBody.password = formData.password;
      }
      await updateSupervisor.mutateAsync({
        params: { supervisorId: editingId },
        body: updateBody,
      });
    } else {
      await createSupervisor.mutateAsync(createBody);
    }
    setFormOpen(false);
    setEditingId(null);
  }, [editingId, createSupervisor, updateSupervisor, formData]);

  const handleDeleteSupervisor = useCallback(
    async (id: string) => {
      const confirmed = await ns.alert.confirm({
        title: "Hapus Supervisor?",
        icon: "warning",
        deskripsi: "Akun supervisor ini akan dinonaktifkan secara permanen.",
        confirmButtonText: "Hapus",
      });
      if (!confirmed) return;
      await deleteSupervisor.mutateAsync({ supervisorId: id });
    },
    [deleteSupervisor, ns.alert],
  );

  return (
    <SupervisorsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        supervisors: list.data ?? [],
        keyword,
        alert: ns.alert,
        detail: detail.data ?? null,
        isDetailPending: detail.isPending,
        isAssigning: assign.isPending,
        isRemoving: removeAssignment.isPending,
        approvedApplications: approvedApplications.data ?? [],
        assignOpen,
        internshipId,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        formOpen,
        formIsPending:
          createSupervisor.isPending ||
          updateSupervisor.isPending ||
          (Boolean(editingId) && editingDetail.isPending),
        editingData:
          editingId && editingDetail.data ? editingDetail.data : null,
        formData,
      }}
      actions={{
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onSelectSupervisor: setSelectedId,
        onCloseDetail: () => setSelectedId(null),
        onOpenAssign: handleOpenAssign,
        onCloseAssign: handleCloseAssign,
        onInternshipIdChange: setInternshipId,
        onSubmitAssign: handleSubmitAssign,
        onRemoveAssignment: handleRemoveAssignment,
        onOpenCreateForm: handleOpenCreateForm,
        onOpenEditForm: handleOpenEditForm,
        onCloseForm: handleCloseForm,
        onChangeForm: handleChangeForm,
        onSubmitForm: handleSubmitForm,
        onDeleteSupervisor: handleDeleteSupervisor,
      }}
    />
  );
}

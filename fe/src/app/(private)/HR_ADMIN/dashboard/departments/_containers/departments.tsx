'use client';

import type {
  DepartmentFormField,
  DepartmentFormState,
} from '@/components/organisms/department/DepartmentFormDialog';
import { DepartmentsSection } from '@/components/page/hr/DepartmentsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { DepartmentResponse } from '@/types/api/department.types';
import { useCallback, useState } from 'react';

const EMPTY_FORM: DepartmentFormState = { code: '', name: '', description: '' };

/**
 * Container halaman Departemen (HR Admin) — orchestration layer.
 *
 * Mengelola list departemen (GET /departments), state form tambah/edit
 * (object state + generic handler, §19.4/§19.5), serta mutasi create/update/
 * delete/toggle status. Konfirmasi hapus memakai alert modal namespace.
 */
export default function HrDepartmentsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentResponse | null>(null);
  const [form, setForm] = useState<DepartmentFormState>(EMPTY_FORM);

  const list = api.department.query.list({
    keyword: keyword || undefined,
    limit: 100,
  });
  const create = api.department.mutate.create();
  const update = api.department.mutate.update();
  const remove = api.department.mutate.delete();

  const handleFieldChange = useCallback((field: DepartmentFormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((department: DepartmentResponse) => {
    setEditing(department);
    setForm({
      code: department.code,
      name: department.name,
      description: department.description ?? '',
    });
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    if (create.isPending || update.isPending) return;
    setFormOpen(false);
    setEditing(null);
  }, [create.isPending, update.isPending]);

  const handleSubmit = useCallback(async () => {
    const data = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };
    if (editing) {
      await update.mutateAsync({
        params: { departmentId: editing.id },
        body: data,
      });
    } else {
      await create.mutateAsync({
        code: data.code,
        name: data.name,
        description: data.description ?? '',
      });
    }
    setFormOpen(false);
    setEditing(null);
  }, [create, editing, form, update]);

  const handleToggleActive = useCallback(
    async (department: DepartmentResponse) => {
      await update.mutateAsync({
        params: { departmentId: department.id },
        body: { isActive: !department.isActive },
      });
    },
    [update],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await ns.alert.confirm({
        title: 'Hapus Departemen?',
        icon: 'question',
        deskripsi:
          'Departemen yang dihapus tidak dapat dikembalikan. Pastikan tidak ada data terkait.',
        confirmButtonText: 'Hapus',
      });
      if (!confirmed) return;
      await remove.mutateAsync({ departmentId: id });
    },
    [ns.alert, remove],
  );

  return (
    <DepartmentsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        departments: list.data ?? [],
        keyword,
        formOpen,
        editing,
        form,
        isSaving: create.isPending || update.isPending,
        isDeleting: remove.isPending,
      }}
      actions={{
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onOpenCreate: handleOpenCreate,
        onOpenEdit: handleOpenEdit,
        onCloseForm: handleCloseForm,
        onFieldChange: handleFieldChange,
        onSubmit: handleSubmit,
        onDelete: handleDelete,
        onToggleActive: handleToggleActive,
      }}
    />
  );
}

'use client';

import type {
  OfficeFormField,
  OfficeFormState,
} from '@/components/organisms/office/OfficeFormDialog';
import { OfficesSection } from '@/components/page/hr/OfficesSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { OfficeResponse } from '@/types/api/office.types';
import { useCallback, useState } from 'react';

const EMPTY_FORM: OfficeFormState = {
  name: '',
  address: '',
  departmentId: '',
  latitude: '',
  longitude: '',
  radiusMeter: '',
};

/**
 * Container halaman Kantor (HR Admin) — orchestration layer.
 *
 * Mengelola list kantor (GET /offices) + master departemen (GET /departments)
 * serta mutasi create/update/delete. Form kantor disimpan sebagai object state
 * di container (§19.4) dengan handler generik `handleFieldChange` (§19.5);
 * koordinat & radius dikonversi Number() saat submit.
 */
export default function HrOfficesContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeResponse | null>(null);
  const [form, setForm] = useState<OfficeFormState>(EMPTY_FORM);

  const list = api.office.query.list({
    keyword: keyword || undefined,
    limit: 100,
  });
  const departments = api.department.query.list({ limit: 100 });
  const create = api.office.mutate.create();
  const update = api.office.mutate.update();
  const remove = api.office.mutate.delete();

  const handleFieldChange = useCallback((field: OfficeFormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((office: OfficeResponse) => {
    setEditing(office);
    setForm({
      name: office.name,
      address: office.address,
      departmentId: office.departmentId,
      latitude: office.latitude != null ? String(office.latitude) : '',
      longitude: office.longitude != null ? String(office.longitude) : '',
      radiusMeter: office.radiusMeter != null ? String(office.radiusMeter) : '',
    });
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    if (create.isPending || update.isPending) return;
    setFormOpen(false);
    setEditing(null);
  }, [create.isPending, update.isPending]);

  const handleSubmit = useCallback(async () => {
    const body = {
      name: form.name.trim(),
      address: form.address.trim(),
      departmentId: form.departmentId,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radiusMeter: Number(form.radiusMeter),
    };
    if (editing) {
      await update.mutateAsync({ params: { officeId: editing.id }, body });
    } else {
      await create.mutateAsync(body);
    }
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }, [create, editing, form, update]);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await ns.alert.confirm({
        title: 'Hapus Kantor?',
        icon: 'question',
        deskripsi: 'Kantor yang dihapus tidak dapat dikembalikan. Pastikan tidak ada data terkait.',
        confirmButtonText: 'Hapus',
      });
      if (!confirmed) return;
      await remove.mutateAsync({ officeId: id });
    },
    [ns.alert, remove],
  );

  return (
    <OfficesSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        offices: list.data ?? [],
        departments: departments.data ?? [],
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
      }}
    />
  );
}

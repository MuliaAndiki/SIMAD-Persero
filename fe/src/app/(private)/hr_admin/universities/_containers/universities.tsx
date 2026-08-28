'use client';

import type {
  UniversityFormField,
  UniversityFormState,
} from '@/components/organisms/institution/UniversityFormDialog';
import { UniversitiesSection } from '@/components/page/hr/UniversitiesSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { InstitutionResponse } from '@/types/api/institution.types';
import { useCallback, useState } from 'react';

const EMPTY_FORM: UniversityFormState = {
  name: '',
  shortName: '',
  educationLevelId: '',
  province: '',
  city: '',
  logo: '',
};

/**
 * Container halaman Universitas / Perguruan Tinggi (HR Admin) — orchestration layer.
 *
 * Mengelola list institusi (GET /institutions) + pagination, search (debounced), filter jenjang & mutasi create/update/delete.
 */
export default function HrUniversitiesContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [selectedEducationLevelId, setSelectedEducationLevelId] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InstitutionResponse | null>(null);
  const [form, setForm] = useState<UniversityFormState>(EMPTY_FORM);

  const debouncedKeyword = useDebounce(keyword, 400);

  const list = api.institution.query.list({
    keyword: debouncedKeyword || undefined,
    educationLevelId: selectedEducationLevelId || undefined,
    page,
    limit: 10,
  });

  const educationLevelsQuery = api.institution.query.educationLevels();

  const create = api.institution.mutate.create();
  const update = api.institution.mutate.update();
  const remove = api.institution.mutate.delete();

  const meta = list.data?.meta as
    | { page?: number; limit?: number; total?: number; totalPages?: number }
    | undefined;

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  const handleEducationLevelChange = useCallback((id: string) => {
    setSelectedEducationLevelId(id);
    setPage(1);
  }, []);

  const handleFieldChange = useCallback((field: UniversityFormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((university: InstitutionResponse) => {
    setEditing(university);
    setForm({
      name: university.name ?? '',
      shortName: university.shortName ?? '',
      educationLevelId: university.educationLevelId ?? '',
      province: university.province ?? '',
      city: university.city ?? '',
      logo: (university.logo as string | null | undefined) ?? '',
    });
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    if (create.isPending || update.isPending) return;
    setFormOpen(false);
    setEditing(null);
  }, [create.isPending, update.isPending]);

  const handleSubmit = useCallback(async () => {
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim() || undefined,
      educationLevelId: form.educationLevelId || undefined,
      province: form.province.trim() || undefined,
      city: form.city.trim() || undefined,
      logo: form.logo.trim() || undefined,
    };

    if (editing) {
      await update.mutateAsync({
        params: { institutionId: editing.id },
        body: payload,
      });
    } else {
      await create.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }, [create, editing, form, update]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove.mutateAsync({ institutionId: id });
    },
    [remove],
  );

  return (
    <UniversitiesSection
      state={{
        isPending: list.isPending,
        isFetching: list.isFetching,
        isError: list.isError,
        errorMessage: list.error?.message,
        universities: list.data?.data ?? [],
        educationLevels: educationLevelsQuery.data ?? [],
        selectedEducationLevelId,
        page: meta?.page ?? page,
        totalPages: meta?.totalPages ?? 1,
        total: meta?.total ?? 0,
        alert: ns.alert,
        keyword,
        formOpen,
        editing,
        form,
        isSaving: create.isPending || update.isPending,
        isDeleting: remove.isPending,
      }}
      actions={{
        onKeywordChange: handleKeywordChange,
        onEducationLevelChange: handleEducationLevelChange,
        onSearch: () => setPage(1),
        onPageChange: setPage,
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

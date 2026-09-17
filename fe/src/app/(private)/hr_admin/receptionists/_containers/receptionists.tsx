'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ReceptionistFormType } from '@/components/organisms/receptionist/ReceptionistFormDialog';
import { ReceptionistsSection } from '@/components/page/hr/ReceptionistsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type {
  CreateReceptionistBody,
  UpdateReceptionistBody,
} from '@/types/api/receptionist.types';

export default function HrReceptionistsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ReceptionistFormType>({
    fullName: '',
    email: '',
    officeId: '',
    password: '',
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const debouncedKeyword = useDebounce(keyword, 500);

  // ── Queries ──────────────────────────────────────────────────────────────
  const list = api.receptionist.query.list({
    keyword: debouncedKeyword || undefined,
    officeId: selectedOfficeId || undefined,
    page,
    limit: 10,
  });

  const offices = api.office.query.list({ limit: 100 });

  const editingDetail = api.receptionist.query.detail(
    { receptionistId: editingId ?? '' },
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
        officeId: editingDetail.data.officeId ?? '',
        password: '',
        isActive: editingDetail.data.isActive,
      });
    }
  }, [editingDetail.data, editingId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      officeId: '',
      password: '',
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

  const handleChangeForm = useCallback((partial: Partial<ReceptionistFormType>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSubmitForm = useCallback(async () => {
    if (editingId) {
      const body: UpdateReceptionistBody = {
        fullName: formData.fullName,
        email: formData.email,
        officeId: formData.officeId,
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

  const handleSelectOffice = useCallback((officeId: string) => {
    setSelectedOfficeId(officeId);
    setPage(1);
  }, []);

  const handleResetFilter = useCallback(() => {
    setSelectedOfficeId('');
    setKeyword('');
    setPage(1);
  }, []);

  const handleKeywordChange = useCallback((val: string) => {
    setKeyword(val);
    setPage(1);
  }, []);

  const receptionists = list.data?.data ?? [];
  const meta = list.data?.meta as
    | { page?: number; limit?: number; total?: number; totalPages?: number }
    | undefined;

  return (
    <ReceptionistsSection
      state={{
        isPending: list.isPending,
        isFetching: list.isFetching,
        isError: list.isError,
        setShowPassword,
        showPassword,
        errorMessage: list.error?.message,
        receptionists,
        offices: offices.data ?? [],
        selectedOfficeId,
        page,
        totalPages: meta?.totalPages ?? 1,
        total: meta?.total ?? 0,
        keyword,
        formOpen,
        isSaving:
          createMutation.isPending ||
          updateMutation.isPending ||
          (Boolean(editingId) && editingDetail.isPending),
        editingData: editingId && editingDetail.data ? editingDetail.data : null,
        formData,
        alert: ns.alert,
      }}
      actions={{
        onKeywordChange: handleKeywordChange,
        onSelectOffice: handleSelectOffice,
        onResetFilter: handleResetFilter,
        onPageChange: setPage,
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

'use client';

import type {
  ApproveApplicationFormField,
  ApproveApplicationFormState,
} from '@/components/organisms/application/ApplicationApproveForm';
import type {
  RejectApplicationFormField,
  RejectApplicationFormState,
} from '@/components/organisms/application/ApplicationRejectForm';
import { ApplicationsSection } from '@/components/page/hr/ApplicationsSection';
import { useApi } from '@/hooks/useService/useApi';
import type { ApplicationStatusValue } from '@/types/api/application.types';
import { useCallback, useState } from 'react';

const EMPTY_APPROVE_FORM: ApproveApplicationFormState = {
  departmentId: '',
  officeLocationId: '',
  supervisorId: '',
  notes: '',
};

const EMPTY_REJECT_FORM: RejectApplicationFormState = {
  reason: '',
};

/**
 * Container halaman Pengajuan Magang (HR Admin) — orchestration layer.
 *
 * Seluruh fetch & mutasi dilakukan di sini: list aplikasi dengan filter status
 * dan keyword, detail aplikasi yang sedang direview, master departemen/kantor/
 * supervisor untuk form approve, serta aksi approve/reject. Mode dialog dan
 * object state form (approve/reject) juga dimiliki container (§19.4/§19.5).
 */
export default function HrApplicationsContainer() {
  const api = useApi();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [approveForm, setApproveForm] = useState<ApproveApplicationFormState>(EMPTY_APPROVE_FORM);
  const [rejectForm, setRejectForm] = useState<RejectApplicationFormState>(EMPTY_REJECT_FORM);

  const list = api.application.query.list({
    status: (statusFilter || undefined) as ApplicationStatusValue | undefined,
    keyword: keyword || undefined,
    limit: 100,
  });
  const detail = api.application.query.detail(
    { id: selectedId ?? '' },
    { enabled: Boolean(selectedId) },
  );
  const departments = api.department.query.list({ limit: 100 });
  const offices = api.office.query.list({ limit: 100 });
  const supervisors = api.supervisor.query.list({ limit: 100 });

  const approve = api.application.mutate.approve();
  const reject = api.application.mutate.reject();

  const handleApproveFieldChange = useCallback(
    (field: ApproveApplicationFormField, value: string) => {
      setApproveForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleRejectFieldChange = useCallback(
    (field: RejectApplicationFormField, value: string) => {
      setRejectForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSelectApplication = useCallback((id: string) => {
    setDialogMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    setSelectedId(id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDialogMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    setSelectedId(null);
  }, []);

  const handleOpenApprove = useCallback(() => {
    setApproveForm(EMPTY_APPROVE_FORM);
    setDialogMode('approve');
  }, []);

  const handleOpenReject = useCallback(() => {
    setRejectForm(EMPTY_REJECT_FORM);
    setDialogMode('reject');
  }, []);

  const handleBackToView = useCallback(() => {
    setDialogMode('view');
  }, []);

  const handleSubmitApprove = useCallback(async () => {
    if (!selectedId) return;
    await approve.mutateAsync({
      params: { id: selectedId },
      body: {
        departmentId: approveForm.departmentId,
        officeLocationId: approveForm.officeLocationId || undefined,
        supervisorId: approveForm.supervisorId,
        notes: approveForm.notes || undefined,
      },
    });
    setSelectedId(null);
    setDialogMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
  }, [approve, approveForm, selectedId]);

  const handleSubmitReject = useCallback(async () => {
    if (!selectedId) return;
    await reject.mutateAsync({
      params: { id: selectedId },
      body: { reason: rejectForm.reason.trim() },
    });
    setSelectedId(null);
    setDialogMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
  }, [reject, rejectForm, selectedId]);

  return (
    <ApplicationsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        applications: list.data ?? [],
        statusFilter,
        keyword,
        detail: detail.data ?? null,
        isDetailPending: detail.isPending,
        isApproving: approve.isPending,
        isRejecting: reject.isPending,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        supervisors: supervisors.data ?? [],
        dialogMode,
        approveForm,
        rejectForm,
      }}
      actions={{
        onStatusChange: setStatusFilter,
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onSelectApplication: handleSelectApplication,
        onCloseDetail: handleCloseDetail,
        onOpenApprove: handleOpenApprove,
        onOpenReject: handleOpenReject,
        onBackToView: handleBackToView,
        onApproveFieldChange: handleApproveFieldChange,
        onRejectFieldChange: handleRejectFieldChange,
        onSubmitApprove: handleSubmitApprove,
        onSubmitReject: handleSubmitReject,
      }}
    />
  );
}

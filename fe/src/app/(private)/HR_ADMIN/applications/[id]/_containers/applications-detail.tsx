'use client';

import type {
  ApproveApplicationFormField,
  ApproveApplicationFormState,
} from '@/components/organisms/application/ApplicationApproveForm';
import type {
  RejectApplicationFormField,
  RejectApplicationFormState,
} from '@/components/organisms/application/ApplicationRejectForm';
import { ApplicationReviewSection } from '@/components/page/hr/ApplicationReviewSection';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter } from 'next/navigation';
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

export default function HrApplicationDetailContainer({ id }: { id: string }) {
  const api = useApi();
  const router = useRouter();

  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [approveForm, setApproveForm] = useState<ApproveApplicationFormState>(EMPTY_APPROVE_FORM);
  const [rejectForm, setRejectForm] = useState<RejectApplicationFormState>(EMPTY_REJECT_FORM);

  const detail = api.application.query.detail({ id }, { enabled: Boolean(id) });

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

  const handleOpenApprove = useCallback(() => {
    setApproveForm(EMPTY_APPROVE_FORM);
    setMode('approve');
  }, []);

  const handleOpenReject = useCallback(() => {
    setRejectForm(EMPTY_REJECT_FORM);
    setMode('reject');
  }, []);

  const handleBackToView = useCallback(() => {
    setMode('view');
  }, []);

  const handleSubmitApprove = useCallback(async () => {
    if (!id) return;
    await approve.mutateAsync({
      params: { id },
      body: {
        departmentId: approveForm.departmentId,
        officeLocationId: approveForm.officeLocationId || undefined,
        supervisorId: approveForm.supervisorId,
        notes: approveForm.notes || undefined,
      },
    });
    setMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    router.push('/HR_ADMIN/applications');
  }, [approve, approveForm, id, router]);

  const handleSubmitReject = useCallback(async () => {
    if (!id) return;
    await reject.mutateAsync({
      params: { id },
      body: { reason: rejectForm.reason.trim() },
    });
    setMode('view');
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    router.push('/HR_ADMIN/applications');
  }, [reject, rejectForm, id, router]);

  return (
    <ApplicationReviewSection
      state={{
        isPending: detail.isPending,
        isError: detail.isError,
        errorMessage: detail.error?.message,
        detail: detail.data ?? null,
        mode,
        isApproving: approve.isPending,
        isRejecting: reject.isPending,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        supervisors: supervisors.data ?? [],
        approveForm,
        rejectForm,
      }}
      actions={{
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

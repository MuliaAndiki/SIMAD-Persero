"use client";

import type {
  ApproveApplicationFormField,
  ApproveApplicationFormState,
} from "@/components/organisms/application/ApplicationApproveForm";
import type {
  RejectApplicationFormField,
  RejectApplicationFormState,
} from "@/components/organisms/application/ApplicationRejectForm";
import { ApplicationsSection } from "@/components/page/hr/ApplicationsSection";
import { useDebounce } from "@/hooks/useDebounce";
import { useApi } from "@/hooks/useService/useApi";
import type {
  ApplicationResponse,
  ApplicationStatusValue,
} from "@/types/api/application.types";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const EMPTY_APPROVE_FORM: ApproveApplicationFormState = {
  departmentId: "",
  officeLocationId: "",
  supervisorId: "",
  notes: "",
};

const EMPTY_REJECT_FORM: RejectApplicationFormState = {
  reason: "",
};

/**
 * Container halaman Pengajuan Magang (HR Admin) — orchestration layer.
 *
 * Seluruh fetch & mutasi dilakukan di sini: list aplikasi dengan filter status
 * dan keyword, plus approve/reject langsung dari tabel (modal).
 */
export default function HrApplicationsContainer() {
  const api = useApi();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [modalMode, setModalMode] = useState<"approve" | "reject" | null>(null);
  const [modalTarget, setModalTarget] = useState<ApplicationResponse | null>(
    null,
  );
  const [approveForm, setApproveForm] =
    useState<ApproveApplicationFormState>(EMPTY_APPROVE_FORM);
  const [rejectForm, setRejectForm] =
    useState<RejectApplicationFormState>(EMPTY_REJECT_FORM);

  const debouncedKeyword = useDebounce(keyword, 1000);

  const list = api.application.query.list({
    status: (statusFilter || undefined) as ApplicationStatusValue | undefined,
    keyword: debouncedKeyword || undefined,
    limit: 100,
  });

  const departments = api.department.query.list({ limit: 100 });
  const offices = api.office.query.list({ limit: 100 });
  const supervisors = api.supervisor.query.list({ limit: 100 });

  const approve = api.application.mutate.approve();
  const reject = api.application.mutate.reject();

  const handleSelectApplication = useCallback(
    (id: string) => {
      router.push(`/hr_admin/applications/${id}`);
    },
    [router],
  );

  const handleOpenApprove = useCallback((app: ApplicationResponse) => {
    setModalTarget(app);
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    setModalMode("approve");
  }, []);

  const handleOpenReject = useCallback((app: ApplicationResponse) => {
    setModalTarget(app);
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
    setModalMode("reject");
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setModalTarget(null);
    setApproveForm(EMPTY_APPROVE_FORM);
    setRejectForm(EMPTY_REJECT_FORM);
  }, []);

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

  const handleSubmitApprove = useCallback(async () => {
    if (!modalTarget) return;
    await approve.mutateAsync({
      params: { id: modalTarget.id },
      body: {
        departmentId: approveForm.departmentId,
        officeLocationId: approveForm.officeLocationId || undefined,
        supervisorId: approveForm.supervisorId,
        notes: approveForm.notes || undefined,
      },
    });
    handleCloseModal();
  }, [approve, approveForm, modalTarget, handleCloseModal]);

  const handleSubmitReject = useCallback(async () => {
    if (!modalTarget) return;
    await reject.mutateAsync({
      params: { id: modalTarget.id },
      body: { reason: rejectForm.reason.trim() },
    });
    handleCloseModal();
  }, [reject, rejectForm, modalTarget, handleCloseModal]);

  return (
    <ApplicationsSection
      state={{
        isPending: list.isPending,
        isFetching: list.isFetching,
        isError: list.isError,
        errorMessage: list.error?.message,
        applications: list.data ?? [],
        statusFilter,
        keyword,
        modalMode,
        approveForm,
        rejectForm,
        isApproving: approve.isPending,
        isRejecting: reject.isPending,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        supervisors: supervisors.data ?? [],
      }}
      actions={{
        onStatusChange: setStatusFilter,
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onSelectApplication: handleSelectApplication,
        onOpenApprove: handleOpenApprove,
        onOpenReject: handleOpenReject,
        onCloseModal: handleCloseModal,
        onApproveFieldChange: handleApproveFieldChange,
        onRejectFieldChange: handleRejectFieldChange,
        onSubmitApprove: handleSubmitApprove,
        onSubmitReject: handleSubmitReject,
      }}
    />
  );
}

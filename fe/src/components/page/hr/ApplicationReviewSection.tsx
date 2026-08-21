"use client";

import { Card } from "@/components/atoms/card";
import {
  ApplicationApproveForm,
  type ApproveApplicationFormField,
  type ApproveApplicationFormState,
} from "@/components/organisms/application/ApplicationApproveForm";
import {
  ApplicationRejectForm,
  type RejectApplicationFormField,
  type RejectApplicationFormState,
} from "@/components/organisms/application/ApplicationRejectForm";
import { ApplicationReviewDetail } from "@/components/organisms/application/ApplicationReviewDetail";
import type { ApplicationResponse } from "@/types/api/application.types";
import type { DepartmentResponse } from "@/types/api/department.types";
import type { OfficeResponse } from "@/types/api/office.types";
import type { SupervisorResponse } from "@/types/api/supervisor.types";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export type ApplicationReviewMode = "view" | "approve" | "reject";

export interface ApplicationReviewSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  detail: ApplicationResponse | null;
  mode: ApplicationReviewMode;
  isApproving: boolean;
  isRejecting: boolean;
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  supervisors: SupervisorResponse[];
  approveForm: ApproveApplicationFormState;
  rejectForm: RejectApplicationFormState;
}

export interface ApplicationReviewSectionActions {
  onOpenApprove: () => void;
  onOpenReject: () => void;
  onBackToView: () => void;
  onApproveFieldChange: (
    field: ApproveApplicationFormField,
    value: string,
  ) => void;
  onRejectFieldChange: (
    field: RejectApplicationFormField,
    value: string,
  ) => void;
  onSubmitApprove: () => void | Promise<void>;
  onSubmitReject: () => void | Promise<void>;
}

export interface ApplicationReviewSectionProps {
  state: ApplicationReviewSectionState;
  actions: ApplicationReviewSectionActions;
}

export function ApplicationReviewSection({
  state,
  actions,
}: ApplicationReviewSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/HR_ADMIN/applications"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Daftar Pengajuan</span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">
            Detail Pengajuan Magang
          </h1>
          <p className="text-sm text-muted-foreground">
            Review dan berikan keputusan untuk pengajuan ini.
          </p>
        </div>
      </header>

      {state.isPending ? (
        <Card className="h-64 animate-pulse bg-muted/20" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data pengajuan</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : state.detail ? (
        <Card className="p-4 sm:p-6 overflow-x-auto">
          {state.mode === "approve" ? (
            <ApplicationApproveForm
              departments={state.departments}
              offices={state.offices}
              supervisors={state.supervisors}
              form={state.approveForm}
              isSubmitting={state.isApproving}
              onFieldChange={actions.onApproveFieldChange}
              onBack={actions.onBackToView}
              onSubmit={actions.onSubmitApprove}
            />
          ) : state.mode === "reject" ? (
            <ApplicationRejectForm
              form={state.rejectForm}
              isSubmitting={state.isRejecting}
              onFieldChange={actions.onRejectFieldChange}
              onBack={actions.onBackToView}
              onSubmit={actions.onSubmitReject}
            />
          ) : (
            <ApplicationReviewDetail
              app={state.detail}
              onApprove={actions.onOpenApprove}
              onReject={actions.onOpenReject}
            />
          )}
        </Card>
      ) : null}
    </section>
  );
}

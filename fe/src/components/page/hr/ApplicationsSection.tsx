'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import {
  ApplicationApproveForm,
  type ApproveApplicationFormField,
  type ApproveApplicationFormState,
} from '@/components/organisms/application/ApplicationApproveForm';
import {
  ApplicationRejectForm,
  type RejectApplicationFormField,
  type RejectApplicationFormState,
} from '@/components/organisms/application/ApplicationRejectForm';
import { ApplicationTable } from '@/components/organisms/application/ApplicationTable';
import type { ApplicationResponse } from '@/types/api/application.types';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface ApplicationsSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  applications: ApplicationResponse[];
  statusFilter: string;
  keyword: string;
  modalMode: 'approve' | 'reject' | null;
  approveForm: ApproveApplicationFormState;
  rejectForm: RejectApplicationFormState;
  isApproving: boolean;
  isRejecting: boolean;
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  supervisors: SupervisorResponse[];
}

export interface ApplicationsSectionActions {
  onStatusChange: (status: string) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onSelectApplication: (id: string) => void;
  onOpenApprove: (app: ApplicationResponse) => void;
  onOpenReject: (app: ApplicationResponse) => void;
  onCloseModal: () => void;
  onApproveFieldChange: (field: ApproveApplicationFormField, value: string) => void;
  onRejectFieldChange: (field: RejectApplicationFormField, value: string) => void;
  onSubmitApprove: () => void | Promise<void>;
  onSubmitReject: () => void | Promise<void>;
}

export interface ApplicationsSectionProps {
  state: ApplicationsSectionState;
  actions: ApplicationsSectionActions;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Diajukan' },
  { value: 'UNDER_REVIEW', label: 'Sedang Direview' },
  { value: 'RESUBMITTED', label: 'Diajukan Ulang' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export function ApplicationsSection({ state, actions }: ApplicationsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const isInitialLoading = state.isPending && state.applications.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Pengajuan Magang</h1>
        <p className="text-sm text-muted-foreground">
          Review dan kelola pengajuan magang dari calon peserta.
        </p>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form onSubmit={handleSubmitSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                actions.onKeywordChange(e.target.value);
              }}
              placeholder="Cari nama / email / nomor pengajuan…"
              className="pl-9 pr-9"
            />
            {state.isFetching && (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>
        <Select
          value={state.statusFilter || 'all'}
          onValueChange={(value) => actions.onStatusChange(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isInitialLoading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data pengajuan</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <ApplicationTable
          applications={state.applications}
          onSelectApplication={actions.onSelectApplication}
          onApprove={actions.onOpenApprove}
          onReject={actions.onOpenReject}
          isApproving={state.isApproving}
          isRejecting={state.isRejecting}
        />
      )}

      {state.modalMode === 'approve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <ApplicationApproveForm
              departments={state.departments}
              offices={state.offices}
              supervisors={state.supervisors}
              form={state.approveForm}
              isSubmitting={state.isApproving}
              onFieldChange={actions.onApproveFieldChange}
              onBack={actions.onCloseModal}
              onSubmit={actions.onSubmitApprove}
            />
          </Card>
        </div>
      )}

      {state.modalMode === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <ApplicationRejectForm
              form={state.rejectForm}
              isSubmitting={state.isRejecting}
              onFieldChange={actions.onRejectFieldChange}
              onBack={actions.onCloseModal}
              onSubmit={actions.onSubmitReject}
            />
          </Card>
        </div>
      )}
    </section>
  );
}

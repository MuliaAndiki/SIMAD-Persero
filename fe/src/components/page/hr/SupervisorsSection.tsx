'use client';

import { AlertCircle, Bell, Loader2, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { UserAuditLogModal } from '@/components/organisms/auditLog/UserAuditLogModal';
import { SendNotificationModal } from '@/components/organisms/notification/SendNotificationModal';
import { SupervisorAssignInternDialog } from '@/components/organisms/supervisor/SupervisorAssignInternDialog';
import { SupervisorDetailDialog } from '@/components/organisms/supervisor/SupervisorDetailDialog';
import {
  SupervisorFormDialog,
  type SupervisorFormType,
} from '@/components/organisms/supervisor/SupervisorFormDialog';
import { SupervisorTable } from '@/components/organisms/supervisor/SupervisorTable';
import type { ApplicationResponse } from '@/types/api/application.types';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorDetailResponse, SupervisorResponse } from '@/types/api/supervisor.types';
import type { AlertContexType } from '@/types/ui';

export interface SupervisorsSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  supervisors: SupervisorResponse[];
  keyword: string;
  detail: SupervisorDetailResponse | null;
  isDetailPending: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  approvedApplications: ApplicationResponse[];
  assignOpen: boolean;
  internshipId: string;
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  formOpen: boolean;
  formIsPending: boolean;
  editingData: SupervisorDetailResponse | null;
  formData: SupervisorFormType;
  alert: AlertContexType;
  isNotificationPending?: boolean;
}

export interface SupervisorsSectionActions {
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onSelectSupervisor: (id: string) => void;
  onCloseDetail: () => void;
  onOpenAssign: () => void;
  onCloseAssign: () => void;
  onInternshipIdChange: (internshipId: string) => void;
  onSubmitAssign: () => void | Promise<void>;
  onRemoveAssignment: (assignmentId: string) => void | Promise<void>;
  onOpenCreateForm: () => void;
  onOpenEditForm: (id: string) => void;
  onCloseForm: () => void;
  onChangeForm: (data: Partial<SupervisorFormType>) => void;
  onSubmitForm: () => void | Promise<void>;
  onDeleteSupervisor: (id: string) => void | Promise<void>;
  onSendNotification?: (data: {
    title: string;
    message: string;
    typeCode?: string;
    isBroadcast?: boolean;
  }) => Promise<void>;
}

export interface SupervisorsSectionProps {
  state: SupervisorsSectionState;
  actions: SupervisorsSectionActions;
}

export function SupervisorsSection({ state, actions }: SupervisorsSectionProps) {
  const [query, setQuery] = useState(state.keyword);
  const [auditUserId, setAuditUserId] = useState<string | null>(null);
  const [auditUserName, setAuditUserName] = useState<string | undefined>();
  const [sendNotifOpen, setSendNotifOpen] = useState(false);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const assignedInternshipIds = (state.detail?.assignments ?? [])
    .map((a) => a.internshipId)
    .filter((id): id is string => Boolean(id));

  const isInitialLoading = state.isPending && state.supervisors.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Supervisor</h1>
          <p className="text-sm text-muted-foreground">
            Kelola supervisor pembimbing dan penugasan peserta magang.
          </p>
        </div>
        {actions.onSendNotification && (
          <Button variant="outline" onClick={() => setSendNotifOpen(true)}>
            <Bell className="mr-2 size-4 text-primary" />+ Kirim Pengumuman
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmitSearch} className="flex flex-1 items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              actions.onKeywordChange(e.target.value);
            }}
            placeholder="Cari nama / email supervisor…"
            className="pl-9 pr-9"
          />
          {state.isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
        <Button type="submit" variant="outline">
          Cari
        </Button>
        <Button type="button" onClick={actions.onOpenCreateForm}>
          <Plus className="mr-2 size-4" />
          Tambah
        </Button>
      </form>

      {isInitialLoading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data supervisor</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <SupervisorTable
          supervisors={state.supervisors}
          onSelectSupervisor={actions.onSelectSupervisor}
          onEditSupervisor={actions.onOpenEditForm}
          onDeleteSupervisor={actions.onDeleteSupervisor}
          onViewAuditLog={(userId, userName) => {
            setAuditUserId(userId);
            setAuditUserName(userName);
          }}
          alert={state.alert}
        />
      )}

      <SupervisorDetailDialog
        open={Boolean(state.detail)}
        supervisor={state.detail}
        isDetailPending={state.isDetailPending}
        isRemoving={state.isRemoving}
        onOpenAssign={actions.onOpenAssign}
        onClose={actions.onCloseDetail}
        onRemoveAssignment={actions.onRemoveAssignment}
      />

      <SupervisorAssignInternDialog
        open={state.assignOpen}
        internshipId={state.internshipId}
        approvedApplications={state.approvedApplications}
        assignedInternshipIds={assignedInternshipIds}
        isAssigning={state.isAssigning}
        onInternshipIdChange={actions.onInternshipIdChange}
        onClose={actions.onCloseAssign}
        onSubmit={actions.onSubmitAssign}
      />

      <SupervisorFormDialog
        open={state.formOpen}
        isEditing={Boolean(state.editingData)}
        onClose={actions.onCloseForm}
        offices={state.offices}
        formData={state.formData}
        onChange={actions.onChangeForm}
        onSubmit={actions.onSubmitForm}
        isPending={state.formIsPending}
      />

      {/* User Audit Log Modal */}
      <UserAuditLogModal
        open={Boolean(auditUserId)}
        userId={auditUserId}
        userName={auditUserName}
        onClose={() => setAuditUserId(null)}
      />

      {/* Broadcast Notification Modal */}
      {actions.onSendNotification && (
        <SendNotificationModal
          open={sendNotifOpen}
          isPending={Boolean(state.isNotificationPending)}
          onClose={() => setSendNotifOpen(false)}
          onSubmit={actions.onSendNotification}
        />
      )}
    </section>
  );
}

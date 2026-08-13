'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { SupervisorAssignInternDialog } from '@/components/organisms/supervisor/SupervisorAssignInternDialog';
import { SupervisorDetailDialog } from '@/components/organisms/supervisor/SupervisorDetailDialog';
import { SupervisorTable } from '@/components/organisms/supervisor/SupervisorTable';
import type { ApplicationResponse } from '@/types/api/application.types';
import type { SupervisorDetailResponse, SupervisorResponse } from '@/types/api/supervisor.types';
import { AlertCircle, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface SupervisorsSectionState {
  isPending: boolean;
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
}

export interface SupervisorsSectionProps {
  state: SupervisorsSectionState;
  actions: SupervisorsSectionActions;
}

/**
 * SupervisorsSection — komposisi halaman Supervisor (HR Admin).
 * Murni presentasi: tanpa fetch API, tanpa state fitur, tanpa komponen besar.
 */
export function SupervisorsSection({ state, actions }: SupervisorsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const assignedInternshipIds = (state.detail?.assignments ?? [])
    .map((a) => a.internshipId)
    .filter((id): id is string => Boolean(id));

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Supervisor</h1>
        <p className="text-sm text-muted-foreground">
          Kelola supervisor pembimbing dan penugasan peserta magang.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data supervisor</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
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
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>
      )}

      {!state.isPending && !state.isError && (
        <SupervisorTable
          supervisors={state.supervisors}
          onSelectSupervisor={actions.onSelectSupervisor}
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
    </section>
  );
}

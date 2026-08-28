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
import { GenerateCertificateModal } from '@/components/organisms/certificate/GenerateCertificateModal';
import {
  AssignSupervisorModal,
  ChangeDepartmentModal,
  ExtendInternshipModal,
} from '@/components/organisms/internship/InternshipActionModals';
import { InternshipsTable } from '@/components/organisms/internship/InternshipsTable';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface InternshipsSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isActionPending?: boolean;
  isError: boolean;
  errorMessage?: string;
  internships: InternshipResponse[];
  statusFilter: string;
  keyword: string;
  departments?: DepartmentResponse[];
  offices?: OfficeResponse[];
  supervisors?: SupervisorResponse[];
}

export interface InternshipsSectionActions {
  onStatusChange: (status: string) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  // Control actions
  onStart?: (id: string) => void;
  onFinish?: (id: string) => void;
  onExtendSubmit?: (id: string, data: { newEndDate: string; reason: string }) => Promise<void>;
  onChangeDepartmentSubmit?: (
    id: string,
    data: { departmentId: string; officeLocationId: string },
  ) => Promise<void>;
  onAssignSupervisorSubmit?: (id: string, data: { supervisorId: string }) => Promise<void>;
  onGenerateCertSubmit?: (internshipId: string) => Promise<void>;
  onArchive?: (id: string) => void;
}

export interface InternshipsSectionProps {
  state: InternshipsSectionState;
  actions: InternshipsSectionActions;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'ONBOARDING_PENDING', label: 'Menunggu Onboarding' },
  { value: 'ONBOARDING_COMPLETED', label: 'Onboarding Selesai' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CERTIFICATE_GENERATED', label: 'Sertifikat Dibuat' },
  { value: 'ARCHIVED', label: 'Diarsipkan' },
];

export function InternshipsSection({ state, actions }: InternshipsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  // Local state for modals
  const [selectedInternship, setSelectedInternship] = useState<InternshipResponse | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [changeDeptOpen, setChangeDeptOpen] = useState(false);
  const [assignSuperOpen, setAssignSuperOpen] = useState(false);
  const [generateCertOpen, setGenerateCertOpen] = useState(false);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const handleOpenExtend = (internship: InternshipResponse) => {
    setSelectedInternship(internship);
    setExtendOpen(true);
  };

  const handleOpenChangeDept = (internship: InternshipResponse) => {
    setSelectedInternship(internship);
    setChangeDeptOpen(true);
  };

  const handleOpenAssignSupervisor = (internship: InternshipResponse) => {
    setSelectedInternship(internship);
    setAssignSuperOpen(true);
  };

  const handleOpenGenerateCert = (internship: InternshipResponse) => {
    setSelectedInternship(internship);
    setGenerateCertOpen(true);
  };

  const isInitialLoading = state.isPending && state.internships.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Magang (Pusat Kontrol)</h1>
        <p className="text-sm text-muted-foreground">
          Kelola siklus hidup magang peserta: mulai, selesaikan, perpanjang, ubah departemen,
          tugaskan supervisor, hingga terbitkan sertifikat.
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
              placeholder="Cari nama / email / NIM…"
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
          <SelectTrigger className="w-full md:w-52">
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
            <p className="font-semibold">Gagal memuat data magang</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <InternshipsTable
          internships={state.internships}
          onStart={actions.onStart}
          onFinish={actions.onFinish}
          onOpenExtend={handleOpenExtend}
          onOpenChangeDept={handleOpenChangeDept}
          onOpenAssignSupervisor={handleOpenAssignSupervisor}
          onOpenGenerateCert={handleOpenGenerateCert}
          onArchive={actions.onArchive}
        />
      )}

      {/* Action Modals */}
      <ExtendInternshipModal
        open={extendOpen}
        isPending={Boolean(state.isActionPending)}
        internship={selectedInternship}
        onClose={() => setExtendOpen(false)}
        onSubmit={async (data) => {
          if (selectedInternship && actions.onExtendSubmit) {
            await actions.onExtendSubmit(selectedInternship.id, data);
          }
        }}
      />

      <ChangeDepartmentModal
        open={changeDeptOpen}
        isPending={Boolean(state.isActionPending)}
        internship={selectedInternship}
        departments={state.departments ?? []}
        offices={state.offices ?? []}
        onClose={() => setChangeDeptOpen(false)}
        onSubmit={async (data) => {
          if (selectedInternship && actions.onChangeDepartmentSubmit) {
            await actions.onChangeDepartmentSubmit(selectedInternship.id, data);
          }
        }}
      />

      <AssignSupervisorModal
        open={assignSuperOpen}
        isPending={Boolean(state.isActionPending)}
        internship={selectedInternship}
        supervisors={state.supervisors ?? []}
        onClose={() => setAssignSuperOpen(false)}
        onSubmit={async (data) => {
          if (selectedInternship && actions.onAssignSupervisorSubmit) {
            await actions.onAssignSupervisorSubmit(selectedInternship.id, data);
          }
        }}
      />

      <GenerateCertificateModal
        open={generateCertOpen}
        isPending={Boolean(state.isActionPending)}
        internship={selectedInternship}
        onClose={() => setGenerateCertOpen(false)}
        onSubmit={async (internshipId) => {
          if (actions.onGenerateCertSubmit) {
            await actions.onGenerateCertSubmit(internshipId);
          }
        }}
      />
    </section>
  );
}

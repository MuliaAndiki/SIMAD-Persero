'use client';

import { AlertCircle, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { OfficeDepartmentDialog } from '@/components/organisms/office/OfficeDepartmentDialog';
import {
  OfficeFormDialog,
  type OfficeFormField,
  type OfficeFormState,
} from '@/components/organisms/office/OfficeFormDialog';
import { OfficeTable } from '@/components/organisms/office/OfficeTable';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { AlertContexType } from '@/types/ui';

export interface OfficesSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  offices: OfficeResponse[];
  keyword: string;
  formOpen: boolean;
  editing: OfficeResponse | null;
  form: OfficeFormState;
  isSaving: boolean;
  isDeleting: boolean;
  departments: DepartmentResponse[];
  deptDialogOpen: boolean;
  deptTarget: OfficeResponse | null;
  selectedDeptIds: string[];
  isSavingDepartments: boolean;
  alert: AlertContexType;
}

export interface OfficesSectionActions {
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (office: OfficeResponse) => void;
  onCloseForm: () => void;
  onFieldChange: (field: OfficeFormField, value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onOpenManageDepartments: (office: OfficeResponse) => void;
  onCloseManageDepartments: () => void;
  onToggleDepartment: (departmentId: string) => void;
  onSubmitDepartments: () => void | Promise<void>;
}

export interface OfficesSectionProps {
  state: OfficesSectionState;
  actions: OfficesSectionActions;
}

/**
 * OfficesSection — komposisi halaman Kantor (HR Admin).
 * Murni presentasi: tanpa fetch API, tanpa state fitur, tanpa komponen besar.
 */
export function OfficesSection({ state, actions }: OfficesSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Kantor</h1>
        <p className="text-sm text-muted-foreground">
          Kelola lokasi kantor dan titik koordinat absensi. Satu kantor dapat melayani banyak
          departemen.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data kantor</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <>
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
                  placeholder="Cari nama / alamat kantor…"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
            <Button onClick={actions.onOpenCreate}>
              <Plus className="size-4" />
              Tambah Kantor
            </Button>
          </div>

          <OfficeTable
            offices={state.offices}
            isDeleting={state.isDeleting}
            onOpenEdit={actions.onOpenEdit}
            onManageDepartments={actions.onOpenManageDepartments}
            onDelete={actions.onDelete}
            alert={state.alert}
          />
        </>
      )}

      <OfficeFormDialog
        open={state.formOpen}
        editing={state.editing}
        form={state.form}
        isSaving={state.isSaving}
        onFieldChange={actions.onFieldChange}
        onClose={actions.onCloseForm}
        onSubmit={actions.onSubmit}
      />

      <OfficeDepartmentDialog
        open={state.deptDialogOpen}
        office={state.deptTarget}
        departments={state.departments}
        selectedIds={state.selectedDeptIds}
        isSaving={state.isSavingDepartments}
        onToggle={actions.onToggleDepartment}
        onClose={actions.onCloseManageDepartments}
        onSubmit={actions.onSubmitDepartments}
      />
    </section>
  );
}

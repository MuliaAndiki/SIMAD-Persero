'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  DepartmentFormDialog,
  type DepartmentFormField,
  type DepartmentFormState,
} from '@/components/organisms/department/DepartmentFormDialog';
import { DepartmentTable } from '@/components/organisms/department/DepartmentTable';
import type { DepartmentResponse } from '@/types/api/department.types';
import { AlertCircle, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface DepartmentsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  departments: DepartmentResponse[];
  keyword: string;
  formOpen: boolean;
  editing: DepartmentResponse | null;
  form: DepartmentFormState;
  isSaving: boolean;
  isDeleting: boolean;
}

export interface DepartmentsSectionActions {
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (department: DepartmentResponse) => void;
  onCloseForm: () => void;
  onFieldChange: (field: DepartmentFormField, value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onToggleActive: (department: DepartmentResponse) => void | Promise<void>;
}

export interface DepartmentsSectionProps {
  state: DepartmentsSectionState;
  actions: DepartmentsSectionActions;
}

/**
 * DepartmentsSection — komposisi halaman Departemen (HR Admin).
 * Murni presentasi: tanpa fetch API, tanpa state fitur, tanpa komponen besar.
 */
export function DepartmentsSection({ state, actions }: DepartmentsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Departemen</h1>
        <p className="text-sm text-muted-foreground">
          Kelola departemen tempat peserta magang ditempatkan.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data departemen</p>
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
                  placeholder="Cari kode / nama departemen…"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
            <Button onClick={actions.onOpenCreate}>
              <Plus className="size-4" />
              Tambah Departemen
            </Button>
          </div>

          <DepartmentTable
            departments={state.departments}
            isDeleting={state.isDeleting}
            onOpenEdit={actions.onOpenEdit}
            onToggleActive={actions.onToggleActive}
            onDelete={actions.onDelete}
          />
        </>
      )}

      <DepartmentFormDialog
        open={state.formOpen}
        editing={state.editing}
        form={state.form}
        isSaving={state.isSaving}
        onFieldChange={actions.onFieldChange}
        onClose={actions.onCloseForm}
        onSubmit={actions.onSubmit}
      />
    </section>
  );
}

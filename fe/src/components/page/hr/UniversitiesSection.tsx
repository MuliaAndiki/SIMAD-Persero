'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  UniversityFormDialog,
  type UniversityFormField,
  type UniversityFormState,
} from '@/components/organisms/institution/UniversityFormDialog';
import { UniversityTable } from '@/components/organisms/institution/UniversityTable';
import type { EducationLevelResponse, InstitutionResponse } from '@/types/api/institution.types';
import type { AlertContexType } from '@/types/ui';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

export interface UniversitiesSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  universities: InstitutionResponse[];
  educationLevels: EducationLevelResponse[];
  selectedEducationLevelId: string;
  keyword: string;
  page: number;
  totalPages: number;
  total: number;
  formOpen: boolean;
  editing: InstitutionResponse | null;
  form: UniversityFormState;
  isSaving: boolean;
  isDeleting: boolean;
  alert: AlertContexType;
}

export interface UniversitiesSectionActions {
  onKeywordChange: (keyword: string) => void;
  onEducationLevelChange: (id: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (university: InstitutionResponse) => void;
  onCloseForm: () => void;
  onFieldChange: (field: UniversityFormField, value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

export interface UniversitiesSectionProps {
  state: UniversitiesSectionState;
  actions: UniversitiesSectionActions;
}

export function UniversitiesSection({ state, actions }: UniversitiesSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const isInitialLoading = state.isPending && state.universities.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Universitas & Perguruan Tinggi</h1>
        <p className="text-sm text-muted-foreground">
          Kelola master data perguruan tinggi / institusi asal peserta magang.
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
              placeholder="Cari universitas, akronim, atau kota…"
              className="pl-9 pr-9"
            />
            {state.isFetching && (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>
          <select
            value={state.selectedEducationLevelId}
            onChange={(e) => actions.onEducationLevelChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Semua Jenjang</option>
            {state.educationLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>
        <Button onClick={actions.onOpenCreate}>
          <Plus className="size-4" />
          Tambah Universitas
        </Button>
      </div>

      {isInitialLoading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data universitas</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <>
          <UniversityTable
            universities={state.universities}
            isDeleting={state.isDeleting}
            onOpenEdit={actions.onOpenEdit}
            onDelete={actions.onDelete}
            alert={state.alert}
          />

          {state.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>
                Halaman {state.page} dari {state.totalPages} ({state.total} data)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={state.page <= 1}
                  onClick={() => actions.onPageChange(state.page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={state.page >= state.totalPages}
                  onClick={() => actions.onPageChange(state.page + 1)}
                >
                  Selanjutnya
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <UniversityFormDialog
        open={state.formOpen}
        editing={state.editing}
        form={state.form}
        educationLevels={state.educationLevels}
        isSaving={state.isSaving}
        onFieldChange={actions.onFieldChange}
        onClose={actions.onCloseForm}
        onSubmit={actions.onSubmit}
      />
    </section>
  );
}

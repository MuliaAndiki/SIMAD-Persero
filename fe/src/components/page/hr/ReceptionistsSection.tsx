'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  ReceptionistFormDialog,
  type ReceptionistFormType,
} from '@/components/organisms/receptionist/ReceptionistFormDialog';
import { ReceptionistTable } from '@/components/organisms/receptionist/ReceptionistTable';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { OfficeResponse } from '@/types/api/office.types';
import type { ReceptionistResponse } from '@/types/api/receptionist.types';
import type { AlertContexType } from '@/types/ui';
import { AlertCircle, Loader2, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

export interface ReceptionistsSectionProps {
  state: {
    isPending: boolean;
    isFetching?: boolean;
    isError?: boolean;
    errorMessage?: string;
    receptionists: ReceptionistResponse[];
    offices: OfficeResponse[];
    selectedOfficeId?: string;
    page?: number;
    totalPages?: number;
    total?: number;
    keyword: string;
    formOpen: boolean;
    isSaving: boolean;
    editingData: ReceptionistResponse | null;
    formData: ReceptionistFormType;
    alert: AlertContexType;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
    showPassword: boolean;
  };
  actions: {
    onKeywordChange: (val: string) => void;
    onSelectOffice?: (id: string) => void;
    onResetFilter?: () => void;
    onPageChange?: (page: number) => void;
    onOpenCreate: () => void;
    onOpenEdit: (id: string) => void;
    onCloseForm: () => void;
    onChangeForm: (data: Partial<ReceptionistFormType>) => void;
    onSubmitForm: () => void | Promise<void>;
    onDelete: (id: string) => void | Promise<void>;
  };
}

export function ReceptionistsSection({ state, actions }: ReceptionistsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const isInitialLoading = state.isPending && state.receptionists.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Resepsionis</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun petugas resepsionis di masing-masing kantor.
          </p>
        </div>
        <Button onClick={actions.onOpenCreate} variant={'outline'}>
          Tambah Resepsionis
        </Button>
      </header>

      {/* Bar Pencarian dan Filter Kantor */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              actions.onKeywordChange(e.target.value);
            }}
            placeholder="Cari nama / email resepsionis…"
            className="pl-9 pr-9"
          />
          {state.isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        {/* Filter Kantor */}
        <div className="w-full sm:w-[220px]">
          <Select
            value={state.selectedOfficeId || '__all__'}
            onValueChange={(val) => actions.onSelectOffice?.(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Semua Kantor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Semua Kantor</SelectItem>
              {state.offices.map((office) => (
                <SelectItem key={office.id} value={office.id}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(state.selectedOfficeId || query) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              actions.onKeywordChange('');
              actions.onResetFilter?.();
            }}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {isInitialLoading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data resepsionis</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <ReceptionistTable
          receptionists={state.receptionists}
          offices={state.offices}
          page={state.page}
          totalPages={state.totalPages}
          total={state.total}
          onPageChange={actions.onPageChange}
          onEdit={actions.onOpenEdit}
          onDelete={actions.onDelete}
          alert={state.alert}
        />
      )}

      <ReceptionistFormDialog
        open={state.formOpen}
        setShowPassword={state.setShowPassword}
        showPassword={state.showPassword}
        isEditing={Boolean(state.editingData)}
        onClose={actions.onCloseForm}
        offices={state.offices}
        formData={state.formData}
        onChange={actions.onChangeForm}
        onSubmit={actions.onSubmitForm}
        isPending={state.isSaving}
      />
    </section>
  );
}

'use client';

import { AlertCircle, Building2, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { OfficeTable } from '@/components/organisms/office/OfficeTable';
import type { OfficeResponse } from '@/types/api/office.types';

export interface OfficesSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  offices: OfficeResponse[];
  keyword: string;
  isDeleting: boolean;
}

export interface OfficesSectionActions {
  onKeywordChange: (keyword: string) => void;
  onDelete: (office: OfficeResponse) => void;
}

export interface OfficesSectionProps {
  state: OfficesSectionState;
  actions: OfficesSectionActions;
}

export function OfficesSection({ state, actions }: OfficesSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const isInitialLoading = state.isPending && state.offices.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="size-6 text-primary" />
          Manajemen Lokasi Kantor & Jadwal Presensi
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola lokasi unit kantor PLN, titik geofence absensi, departemen yang dinaungi, serta aturan jam masuk (maksimal jam 08:00 WIB) dan jam pulang.
        </p>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                actions.onKeywordChange(e.target.value);
              }}
              placeholder="Cari nama atau alamat kantor…"
              className="pl-9 pr-9"
            />
            {state.isFetching && (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>
        </div>

        <Button asChild className="gap-2 shrink-0">
          <Link href="/hr_admin/offices/create">
            <Plus className="size-4" />
            Tambah Kantor Baru
          </Link>
        </Button>
      </div>

      {isInitialLoading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data kantor</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <OfficeTable
          offices={state.offices}
          isDeleting={state.isDeleting}
          onDelete={actions.onDelete}
        />
      )}
    </section>
  );
}

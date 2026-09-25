'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { QuotaTable } from '@/components/organisms/quota/QuotaTable';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { QuotaItem } from '@/types/api/quota.types';
import { AlertCircle, Building2, Filter, Loader2, MapPin, Plus, Users } from 'lucide-react';
import Link from 'next/link';

export interface QuotasSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  quotas: QuotaItem[];
  offices: OfficeResponse[];
  departments: DepartmentResponse[];
  selectedOfficeId: string;
  selectedDepartmentId: string;
}

export interface QuotasSectionActions {
  onOfficeFilterChange: (officeId: string) => void;
  onDepartmentFilterChange: (deptId: string) => void;
  onDelete: (quota: QuotaItem) => void | Promise<void>;
  onToggleActive?: (quota: QuotaItem) => void | Promise<void>;
}

export interface QuotasSectionProps {
  state: QuotasSectionState;
  actions: QuotasSectionActions;
}

export function QuotasSection({ state, actions }: QuotasSectionProps) {
  const isInitialLoading = state.isPending && state.quotas.length === 0;

  // Total summary stats
  const totalCapacity = state.quotas.reduce((acc, q) => acc + (q.totalCapacity || 0), 0);
  const totalActiveQuotas = state.quotas.filter((q) => q.isActive).length;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Manajemen Kuota Magang Kantor & Alokasi Departemen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tentukan total kuota master per kantor cabang PLN dan kelola pembagian alokasi slot untuk setiap bidang/divisi.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/hr_admin/quotas/create">
            <Plus className="h-4 w-4" />
            Tambah Kuota Kantor
          </Link>
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Kuota Seluruh Kantor</p>
            <h3 className="text-2xl font-bold text-foreground">{totalCapacity} Slot</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Periode Kuota Aktif</p>
            <h3 className="text-2xl font-bold text-foreground">{totalActiveQuotas} Kantor</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-blue-500/5 border-blue-500/20">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Lokasi Kantor Terdaftar</p>
            <h3 className="text-2xl font-bold text-foreground">{state.offices.length} Kantor</h3>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
            <Filter className="h-4 w-4" />
            Filter:
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={state.selectedOfficeId}
              onValueChange={actions.onOfficeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Kantor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kantor</SelectItem>
                {state.offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={state.selectedDepartmentId}
              onValueChange={actions.onDepartmentFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Departemen</SelectItem>
                {state.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.isFetching && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat data...
            </div>
          )}
        </div>
      </Card>

      {/* Content Table / States */}
      {isInitialLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data kuota kantor...</p>
        </Card>
      ) : state.isError ? (
        <Card className="p-8 border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Gagal memuat kuota</h4>
            <p className="text-xs text-destructive/80 mt-0.5">
              {state.errorMessage ?? 'Terjadi kesalahan saat mengambil data kuota.'}
            </p>
          </div>
        </Card>
      ) : (
        <QuotaTable
          quotas={state.quotas}
          onDelete={actions.onDelete}
          onToggleActive={actions.onToggleActive}
        />
      )}
    </section>
  );
}

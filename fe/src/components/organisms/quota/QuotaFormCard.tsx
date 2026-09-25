'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { DepartmentAllocationInput, QuotaItem } from '@/types/api/quota.types';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface QuotaFormValues {
  officeLocationId: string;
  totalCapacity: number;
  notes?: string;
  isActive: boolean;
  allocations: DepartmentAllocationInput[];
}

interface QuotaFormCardProps {
  initialData?: QuotaItem | null;
  offices: OfficeResponse[];
  departments: DepartmentResponse[];
  isSaving: boolean;
  onSave: (values: QuotaFormValues) => Promise<void>;
}

export function QuotaFormCard({
  initialData,
  offices,
  departments,
  isSaving,
  onSave,
}: QuotaFormCardProps) {
  const isEdit = Boolean(initialData);

  // Inisialisasi alokasi departemen dari initialData atau 0 untuk semua departemen
  const initialAllocations = useMemo(() => {
    const existingMap = new Map<string, number>();
    (initialData?.departmentAllocations || []).forEach((a) => {
      existingMap.set(a.departmentId, a.capacity);
    });

    return departments.map((d) => ({
      departmentId: d.id,
      capacity: existingMap.get(d.id) ?? 0,
      notes: '',
    }));
  }, [initialData, departments]);

  const [form, setForm] = useState<QuotaFormValues>({
    officeLocationId: initialData?.officeLocationId ?? offices[0]?.id ?? '',
    totalCapacity: initialData?.totalCapacity ?? 20,
    notes: initialData?.notes ?? '',
    isActive: initialData?.isActive ?? true,
    allocations: initialAllocations,
  });

  const selectedOffice = useMemo(() => {
    return offices.find((o) => o.id === form.officeLocationId) ?? null;
  }, [offices, form.officeLocationId]);

  // Departemen yang dinaungi kantor terpilih (atau fallback ke semua departemen)
  const availableDepartments = useMemo(() => {
    if (selectedOffice?.departments && selectedOffice.departments.length > 0) {
      const officeDeptIds = new Set(selectedOffice.departments.map((d) => d.id));
      return departments.filter((d) => officeDeptIds.has(d.id));
    }
    return departments;
  }, [selectedOffice, departments]);

  const handleAllocationChange = (deptId: string, capacity: number) => {
    setForm((prev) => {
      const existing = [...prev.allocations];
      const index = existing.findIndex((a) => a.departmentId === deptId);
      if (index >= 0) {
        existing[index] = { ...existing[index], capacity: Math.max(0, capacity) };
      } else {
        existing.push({ departmentId: deptId, capacity: Math.max(0, capacity) });
      }
      return { ...prev, allocations: existing };
    });
  };

  const handleDistributeEvenly = () => {
    if (availableDepartments.length === 0 || !form.totalCapacity) return;

    const count = availableDepartments.length;
    const basePerDept = Math.floor(form.totalCapacity / count);
    let remainder = form.totalCapacity % count;

    const newAllocations = departments.map((dept) => {
      const isAvailableInOffice = availableDepartments.some((d) => d.id === dept.id);
      if (!isAvailableInOffice) {
        return { departmentId: dept.id, capacity: 0 };
      }

      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      return {
        departmentId: dept.id,
        capacity: basePerDept + extra,
      };
    });

    setForm((prev) => ({ ...prev, allocations: newAllocations }));
    toast.success('Kuota berhasil dibagi merata ke seluruh bidang');
  };

  const activeAllocations = useMemo(() => {
    return form.allocations.filter((a) => a.capacity > 0);
  }, [form.allocations]);

  const totalAllocated = useMemo(() => {
    return activeAllocations.reduce((sum, a) => sum + (Number(a.capacity) || 0), 0);
  }, [activeAllocations]);

  const isOverAllocated = totalAllocated > Number(form.totalCapacity);
  const remainingToAllocate = Math.max(0, Number(form.totalCapacity) - totalAllocated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.officeLocationId) {
      toast.error('Pilih kantor cabang PLN terlebih dahulu');
      return;
    }
    if (!form.totalCapacity || form.totalCapacity < 1) {
      toast.error('Total kuota kantor minimal 1 peserta');
      return;
    }
    if (isOverAllocated) {
      toast.error(
        `Total alokasi bidang (${totalAllocated}) melebihi kuota kapasitas kantor (${form.totalCapacity})`,
      );
      return;
    }

    await onSave({
      ...form,
      totalCapacity: Number(form.totalCapacity),
      allocations: activeAllocations,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/hr_admin/quotas" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="size-3.5" />
              Daftar Kuota Kantor
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {isEdit ? `Edit Kuota: ${selectedOffice?.name || 'Kantor'}` : 'Tambah Master Kuota'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            {isEdit ? 'Ubah Kuota Kantor & Alokasi Bidang' : 'Buat Master Kuota Kantor PLN Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Konfigurasikan total kuota kapasitas penerimaan magang kantor serta distribusi slot per departemen.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild disabled={isSaving}>
            <Link href="/hr_admin/quotas">Batal</Link>
          </Button>
          <Button type="submit" disabled={isSaving || isOverAllocated} className="gap-2">
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSaving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kuota'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Office & Main Capacity */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Unit Kantor & Kapasitas Master
              </CardTitle>
              <CardDescription>
                Pilih lokasi kantor PLN dan tentukan total kuota maksimal peserta magang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Office Selector */}
              <div className="grid gap-2">
                <Label htmlFor="officeLocationId" className="font-semibold">
                  Lokasi Unit Kantor PLN <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="p-3 rounded-lg border bg-muted/40 text-sm space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="size-4 text-primary shrink-0" />
                      {selectedOffice?.name || 'Kantor PLN'}
                    </p>
                    {selectedOffice?.address && (
                      <p className="text-xs text-muted-foreground">{selectedOffice.address}</p>
                    )}
                  </div>
                ) : (
                  <Select
                    value={form.officeLocationId}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, officeLocationId: val }))}
                  >
                    <SelectTrigger id="officeLocationId">
                      <SelectValue placeholder="Pilih Kantor PLN" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((off) => (
                        <SelectItem key={off.id} value={off.id}>
                          {off.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Total Capacity */}
              <div className="grid gap-2">
                <Label htmlFor="totalCapacity" className="font-semibold">
                  Total Kapasitas Kuota Kantor <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="totalCapacity"
                    type="number"
                    min="1"
                    max="500"
                    value={form.totalCapacity}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, totalCapacity: Number(e.target.value) || 0 }))
                    }
                    className="font-mono text-base font-bold pr-20"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    Peserta
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Batas maksimal penerimaan seluruh anak magang aktif di unit kantor ini.
                </p>
              </div>

              {/* Status Active Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 bg-background">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-semibold">
                    Status Kuota Aktif
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Aktifkan agar kantor ini dapat menerima pendaftaran magang baru.
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(val) => setForm((prev) => ({ ...prev, isActive: val }))}
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Catatan penetapan kuota dari HR..."
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Department Allocations Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    Distribusi Alokasi Kuota per Bidang / Departemen
                  </CardTitle>
                  <CardDescription>
                    Tentukan jatah slot untuk masing-masing bidang di kantor {selectedOffice?.name || 'ini'}.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDistributeEvenly}
                  className="gap-1.5 text-xs self-start sm:self-auto shrink-0"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  Bagi Rata Otomatis
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Allocation Progress Bar */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isOverAllocated
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : totalAllocated === form.totalCapacity
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>
                    Status Alokasi:{' '}
                    <strong className="text-sm">
                      {totalAllocated} / {form.totalCapacity} Slot
                    </strong>
                  </span>
                  {isOverAllocated ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="size-3" />
                      Melebihi Kuota (+{totalAllocated - form.totalCapacity})
                    </Badge>
                  ) : totalAllocated === form.totalCapacity ? (
                    <Badge variant="default" className="bg-emerald-600 gap-1">
                      <CheckCircle2 className="size-3" />
                      Pas (100% Teralokasi)
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      Sisa Belum Dibagi: <strong>{remainingToAllocate} Slot</strong>
                    </span>
                  )}
                </div>

                {/* Visual Bar */}
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverAllocated
                        ? 'bg-destructive'
                        : totalAllocated === form.totalCapacity
                        ? 'bg-emerald-500'
                        : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, form.totalCapacity ? (totalAllocated / form.totalCapacity) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Department Allocation Steppers List */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Daftar Bidang & Jumlah Slot yang Diberikan
                </Label>

                {availableDepartments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs rounded-lg border border-dashed">
                    Belum ada departemen yang dihubungkan ke kantor ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                    {availableDepartments.map((dept) => {
                      const currentAllocation =
                        form.allocations.find((a) => a.departmentId === dept.id)?.capacity ?? 0;

                      return (
                        <div
                          key={dept.id}
                          className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                            currentAllocation > 0
                              ? 'bg-primary/5 border-primary/40'
                              : 'bg-background hover:bg-muted/30 border-border'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold text-foreground truncate block">
                              {dept.name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {dept.code || 'DEPT'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleAllocationChange(dept.id, currentAllocation - 1)}
                              disabled={currentAllocation <= 0}
                              className="size-7 text-sm font-bold"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={form.totalCapacity}
                              value={currentAllocation}
                              onChange={(e) =>
                                handleAllocationChange(dept.id, Number(e.target.value) || 0)
                              }
                              className="w-16 text-center font-mono font-bold text-sm h-7"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleAllocationChange(dept.id, currentAllocation + 1)}
                              className="size-7 text-sm font-bold"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default QuotaFormCard;

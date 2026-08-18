"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { InternshipsTable } from "@/components/organisms/internship/InternshipsTable";
import type { InternshipResponse } from "@/types/api/internship.types";
import { AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

export interface InternshipsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  internships: InternshipResponse[];
  statusFilter: string;
  keyword: string;
}

export interface InternshipsSectionActions {
  onStatusChange: (status: string) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
}

export interface InternshipsSectionProps {
  state: InternshipsSectionState;
  actions: InternshipsSectionActions;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "ONBOARDING_PENDING", label: "Menunggu Onboarding" },
  { value: "ONBOARDING_COMPLETED", label: "Onboarding Selesai" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CERTIFICATE_GENERATED", label: "Sertifikat Dibuat" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

/**
 * InternshipsSection — komposisi halaman Magang (HR Admin).
 * Murni presentasi: tanpa fetch API, tanpa state fitur (selain draft
 * pencarian lokal), tanpa komponen besar inline.
 */
export function InternshipsSection({
  state,
  actions,
}: InternshipsSectionProps) {
  const [query, setQuery] = useState(state.keyword);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Magang</h1>
        <p className="text-sm text-muted-foreground">
          Pantau status magang peserta. Magang yang onboarding-nya telah selesai
          otomatis menjadi Aktif pada tanggal mulai yang ditentukan.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data magang</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <form
              onSubmit={handleSubmitSearch}
              className="flex flex-1 items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    actions.onKeywordChange(e.target.value);
                  }}
                  placeholder="Cari nama / email / NIM…"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
            <Select
              value={state.statusFilter || "all"}
              onValueChange={(value) =>
                actions.onStatusChange(value === "all" ? "" : value)
              }
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

          <InternshipsTable internships={state.internships} />
        </>
      )}
    </section>
  );
}

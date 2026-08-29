import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { SkillResponse } from '@/types/api/internship.types';
import { AlertCircle, Check, Loader2, Plus, Save, Search, Sparkles, Trash2, X, ArrowLeft } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';


export type ProficiencyValue = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Pemula' },
  { value: 'INTERMEDIATE', label: 'Menengah' },
  { value: 'ADVANCED', label: 'Mahir' },
] as const;

const PROFICIENCY_LABEL: Record<ProficiencyValue, string> = {
  BEGINNER: 'Pemula',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Mahir',
};

/** Satu skill yang dipilih user (belum dikirim ke server). */
export interface SelectedSkill {
  skill: SkillResponse;
  proficiency: ProficiencyValue;
}

export interface ProfileSkillsSectionProps {
  state: {
    search: string;
    proficiency: ProficiencyValue;
    skills: SkillResponse[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    addedSkillIds: Set<string>;
    removingSkillIds: Set<string>;
    isProfileLoading: boolean;
    hasProfile: boolean;
    selectedSkills: SelectedSkill[];
    isSubmitting: boolean;
    router:AppRouterInstance
  };
  service: {
    onSearchChange: (value: string) => void;
    onProficiencyChange: (value: ProficiencyValue) => void;
    onToggleSelect: (skill: SkillResponse) => void;
    onRemoveSelected: (skillId: string) => void;
    onRemoveSkill: (skillId: string) => void;
    onSubmit: () => void;
  };
}

/**
 * Section halaman "Kelola Skill".
 *
 * Skill dipilih/disimpan dulu ke array lokal (selectedSkills), baru dikirim
 * sekaligus lewat satu request POST /internships/add-skills saat tombol
 * "Simpan" ditekan. Skill yang sudah tersimpan bisa dihapus lewat
 * DELETE /internships/remove-skill/:skillId. Section murni presentasi.
 */
export function ProfileSkillsSection({ state, service }: ProfileSkillsSectionProps) {
  if (state.isProfileLoading || state.isLoading) {
    return (
      <PhantomSkeleton loading>
        <Card className="h-72" />
      </PhantomSkeleton>
    );
  }

  const isSelected = (skillId: string) =>
    state.selectedSkills.some((item) => item.skill.id === skillId);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div>
        <Button onClick={() => state.router.back()} size={"sm"} variant={'outline'}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
          </div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sparkles className="size-5 text-primary" />
          Kelola Skill
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih skill yang Anda miliki, lalu simpan semuanya sekaligus.
        </p>
      </header>

      {!state.hasProfile && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">Profil magang belum lengkap</span>
            <span className="text-muted-foreground">
              Lengkapi profil magang terlebih dahulu sebelum menambahkan skill.
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-4 text-primary" />
            Cari Skill
          </CardTitle>
          <CardDescription>
            Ketik nama atau kategori skill, lalu pilih tingkat keahlian.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={state.search}
              onChange={(e) => service.onSearchChange(e.target.value)}
              placeholder="Cari skill…"
              className="sm:flex-1"
            />
            <Select
              value={state.proficiency}
              onValueChange={(value) => service.onProficiencyChange(value as ProficiencyValue)}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Tingkat keahlian" />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.isError ? (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">Gagal memuat daftar skill</span>
                <span className="text-muted-foreground">
                  {state.errorMessage ||
                    'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
                </span>
              </div>
            </div>
          ) : state.skills.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              Skill tidak ditemukan. Coba kata kunci lain.
            </p>
          ) : (
            <ul className="divide-y">
              {state.skills.map((skill) => {
                const isAdded = state.addedSkillIds.has(skill.id);
                const selected = isSelected(skill.id);
                const isRemoving = state.removingSkillIds.has(skill.id);
                return (
                  <li key={skill.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {skill.name || 'Tanpa nama'}
                      </span>
                      {skill.category ? <Badge variant="secondary">{skill.category}</Badge> : null}
                    </div>
                    {isAdded ? (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="gap-1">
                          <Check className="size-3" />
                          Ditambahkan
                        </Badge>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Hapus ${skill.name || 'skill'} dari profil`}
                          disabled={isRemoving}
                          onClick={() => service.onRemoveSkill(skill.id)}
                        >
                          {isRemoving ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? 'default' : 'outline'}
                        disabled={!state.hasProfile}
                        onClick={() => service.onToggleSelect(skill)}
                      >
                        {selected ? <Check className="size-4" /> : <Plus className="size-4" />}
                        {selected ? 'Dipilih' : 'Pilih'}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="size-4 text-primary" />
            Skill Dipilih ({state.selectedSkills.length})
          </CardTitle>
          <CardDescription>Tinjau kembali pilihan Anda sebelum disimpan ke profil.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.selectedSkills.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              Belum ada skill yang dipilih.
            </p>
          ) : (
            <ul className="divide-y">
              {state.selectedSkills.map(({ skill, proficiency }) => (
                <li key={skill.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {skill.name || 'Tanpa nama'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {skill.category ? <Badge variant="secondary">{skill.category}</Badge> : null}
                      <Badge>{PROFICIENCY_LABEL[proficiency]}</Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Hapus ${skill.name || 'skill'}`}
                    onClick={() => service.onRemoveSelected(skill.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            className="sm:self-end"
            disabled={state.selectedSkills.length === 0 || !state.hasProfile || state.isSubmitting}
            onClick={service.onSubmit}
          >
            {state.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {state.isSubmitting ? 'Menyimpan…' : `Simpan ${state.selectedSkills.length} Skill`}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

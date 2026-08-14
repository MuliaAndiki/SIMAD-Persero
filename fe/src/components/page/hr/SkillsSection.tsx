import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Search, AlertCircle, Trash2, Pencil, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { SkillResponse } from "@/types/api/internship.types";

export interface SkillsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  skills: SkillResponse[];
  keyword: string;
  isSaving: boolean;
  isDeleting: boolean;
}

export interface SkillsSectionActions {
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  onAddSkill: (data: {
    name: string;
    category: string;
  }) => void | Promise<void>;
  onUpdateSkill: (
    skill: SkillResponse,
    data: { name: string; category: string },
  ) => void | Promise<void>;
  onDeleteSkill: (skill: SkillResponse) => void | Promise<void>;
}

export interface SkillsSectionProps {
  state: SkillsSectionState;
  actions: SkillsSectionActions;
}

interface SkillFormState {
  name: string;
  category: string;
}

const EMPTY_FORM: SkillFormState = { name: "", category: "" };

export function SkillsSection({ state, actions }: SkillsSectionProps) {
  const [editing, setEditing] = useState<SkillResponse | "new" | null>(null);
  const [form, setForm] = useState<SkillFormState>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    actions.onSearch();
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };

  const openEdit = (skill: SkillResponse) => {
    setForm({
      name: skill.name ?? "",
      category: skill.category ?? "",
    });
    setEditing(skill);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    if (editing === "new") {
      await actions.onAddSkill({
        name: form.name.trim(),
        category: form.category.trim(),
      });
    } else if (editing) {
      await actions.onUpdateSkill(editing, {
        name: form.name.trim(),
        category: form.category.trim(),
      });
    }
    closeModal();
  };

  const handleDelete = async (skill: SkillResponse) => {
    setDeletingId(skill.id);
    try {
      await actions.onDeleteSkill(skill);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Keterampilan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola daftar keterampilan dan kategori untuk peserta magang.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data keterampilan</p>
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
                  value={state.keyword}
                  onChange={(e) => actions.onKeywordChange(e.target.value)}
                  placeholder="Cari keterampilan…"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
            <Button onClick={openCreate}>Tambah Keterampilan</Button>
          </div>

          {state.skills.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Tidak ada keterampilan yang ditemukan.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {state.skills.map((skill) => (
                <Card
                  key={skill.id}
                  className="flex flex-col gap-2 p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">
                        {skill.name ?? "Tidak ada nama"}
                      </span>
                      <span className="w-fit rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {skill.category ?? "Tidak dikategorikan"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(skill)}
                        aria-label={`Edit ${skill.name ?? "skill"}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => void handleDelete(skill)}
                        disabled={state.isDeleting && deletingId === skill.id}
                        aria-label={`Hapus ${skill.name ?? "skill"}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing === "new"
                  ? "Tambah Keterampilan"
                  : "Edit Keterampilan"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={closeModal}
                aria-label="Tutup"
              >
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Nama *
                </span>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: JavaScript"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Kategori *
                </span>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="Contoh: Programming"
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !form.name.trim() || !form.category.trim() || state.isSaving
                  }
                >
                  {state.isSaving ? "Menyimpan…" : "Simpan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}

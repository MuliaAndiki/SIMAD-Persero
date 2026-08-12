import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Card } from '@/components/atoms/card';

import InternProfileForm from '@/components/organisms/form/InternForm';
import type { InstitutionResponse } from '@/types/api/institution.types';
import type { PickMergeInternship } from '@/types/api/internship.types';
import { AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';

export interface InternProfileSectionProps {
  state: {
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    institutions: InstitutionResponse[];
    isSubmitting: boolean;
    formApplication: PickMergeInternship;
    setFormApplication: React.Dispatch<React.SetStateAction<PickMergeInternship>>;
    institutionId: string;
    setInstitutionId: React.Dispatch<React.SetStateAction<string>>;
  };
  service: {
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  };
}

export function InternProfileSection({ state, service }: InternProfileSectionProps) {
  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <Card className="h-72" />
      </PhantomSkeleton>
    );
  }

  if (state.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">Gagal memuat data institusi</span>
          <span className="text-muted-foreground">
            {state.errorMessage || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Profil Magang</h1>
        <p className="text-sm text-muted-foreground">
          Lengkapi data institusi pendidikan dan data diri peserta magang.
        </p>
      </header>

      <InternProfileForm
        institutions={state.institutions}
        isPending={state.isSubmitting}
        //
        handleSubmit={service.handleSubmit}
        formApplication={state.formApplication}
        setFormApplication={state.setFormApplication}
        institutionId={state.institutionId}
        setInstitutionId={state.setInstitutionId}
      />
    </section>
  );
}

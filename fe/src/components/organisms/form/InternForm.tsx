import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { PickMergeInternship } from '@/types/api/internship.types';

import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';

import { InstitutionCombobox } from '@/components/organisms/institution/InstitutionCombobox';
import type { InstitutionResponse } from '@/types/api/institution.types';
import { GraduationCap, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';

interface InternProfileFormProps {
  formApplication: PickMergeInternship;
  setFormApplication: React.Dispatch<React.SetStateAction<PickMergeInternship>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  institutions: InstitutionResponse[];
  isPending: boolean;
  institutionId: string;
  setInstitutionId: React.Dispatch<React.SetStateAction<string>>;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Laki-laki' },
  { value: 'FEMALE', label: 'Perempuan' },
] as const;
const InternProfileForm: React.FC<InternProfileFormProps> = ({
  formApplication,
  setFormApplication,
  handleSubmit,
  institutionId,
  setInstitutionId,
  institutions,
  isPending,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          Data Magang
        </CardTitle>
        <CardDescription>
          Informasi institusi pendidikan dan data diri yang digunakan selama magang.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Institusi Pendidikan *</span>
            <InstitutionCombobox
              institutions={institutions}
              value={institutionId}
              onChange={setInstitutionId}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nama Jurusan *
              </label>
              <Input
                id="name"
                value={formApplication.name}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Contoh: Teknik Informatika"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="studentNumber" className="text-sm font-medium">
                NIM/NPM *
              </label>
              <Input
                id="studentNumber"
                value={formApplication.studentNumber}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    studentNumber: e.target.value,
                  }))
                }
                placeholder="Contoh: 2115010001"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Jenis Kelamin *</span>
              <Select
                value={formApplication.gender}
                onValueChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    gender: e,
                  }))
                }
              >
                <SelectTrigger className="w-full border-2 border-gray-100 rounded-lg">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Nomor Telepon *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formApplication.phone}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="birthPlace" className="text-sm font-medium">
                Tempat Lahir *
              </label>
              <Input
                id="birthPlace"
                value={formApplication.birthPlace}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    birthPlace: e.target.value,
                  }))
                }
                placeholder="Contoh: Jakarta"
              />
            </div>

            <div className="flex flex-col gap-2 min-w-0 w-full max-w-full overflow-hidden">
              <label htmlFor="birthDate" className="text-sm font-medium">
                Tanggal Lahir *
              </label>
              <Input
                id="birthDate"
                type="date"
                value={formApplication.birthDate}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                className="w-full min-w-0 max-w-full overflow-hidden"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="address" className="text-sm font-medium">
                Alamat *
              </label>
              <textarea
                id="address"
                value={formApplication.address}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Alamat tempat tinggal saat ini"
                rows={3}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="emergencyContact" className="text-sm font-medium">
                Kontak Darurat *
              </label>
              <Input
                id="emergencyContact"
                value={formApplication.emergencyContact}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    emergencyContact: e.target.value,
                  }))
                }
                placeholder="Nama dan nomor telepon yang dapat dihubungi"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio <span className="text-muted-foreground">(opsional)</span>
              </label>
              <textarea
                id="bio"
                value={formApplication.bio}
                onChange={(e) =>
                  setFormApplication((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                placeholder="Tuliskan deskripsi singkat tentang Anda"
                rows={3}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button asChild type="button" variant="outline">
              <Link href="/intern/profile">Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? 'Menyimpan…' : 'Simpan Profil Magang'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InternProfileForm;

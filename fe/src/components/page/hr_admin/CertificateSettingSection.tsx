import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Award, Image as ImageIcon, Save, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface CertificateSettingSectionState {
  isPending: boolean;
  signerName: string;
  signerRole: string;
}

export interface CertificateSettingSectionService {
  onSaveSettings: (data: {
    signerName: string;
    signerRole: string;
    signatureFile?: File;
  }) => Promise<void>;
}

export interface CertificateSettingSectionProps {
  state: CertificateSettingSectionState;
  service: CertificateSettingSectionService;
}

export function CertificateSettingSection({ state, service }: CertificateSettingSectionProps) {
  const [signerName, setSignerName] = useState(state.signerName);
  const [signerRole, setSignerRole] = useState(state.signerRole);
  const [signatureFile, setSignatureFile] = useState<File | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await service.onSaveSettings({ signerName, signerRole, signatureFile });
    setIsSaving(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSignatureFile(e.target.files[0]);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan Sertifikat</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi informasi penandatangan dan template sertifikat untuk peserta magang.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Form Pengaturan */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Identitas Penandatangan</CardTitle>
                <CardDescription>
                  Informasi ini akan tercetak pada bagian tanda tangan di semua sertifikat magang
                  yang diterbitkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="signerName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Nama Penandatangan
                  </label>
                  <Input
                    id="signerName"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.T., M.T."
                    disabled={state.isPending || isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signerRole"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Jabatan Penandatangan
                  </label>
                  <Input
                    id="signerRole"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    placeholder="Contoh: Manager HRD"
                    disabled={state.isPending || isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signature"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    File Tanda Tangan (Opsional)
                  </label>
                  <Card className="border-dashed shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-6 pb-6 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {signatureFile ? (
                          <ImageIcon className="size-6 text-primary" />
                        ) : (
                          <UploadCloud className="size-6 text-primary" />
                        )}
                      </div>
                      <div className="mt-4 flex flex-col items-center text-sm">
                        <label
                          htmlFor="signature-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none hover:underline"
                        >
                          <span>Unggah foto tanda tangan</span>
                          <Input
                            id="signature-upload"
                            name="signature-upload"
                            type="file"
                            accept="image/png, image/jpeg"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={state.isPending || isSaving}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG atau JPG (Maks. 2MB). Disarankan berlatar transparan.
                        </p>
                      </div>

                      {signatureFile && (
                        <div className="mt-4 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
                          <span className="truncate max-w-[200px] font-medium">
                            {signatureFile.name}
                          </span>
                          <span className="text-muted-foreground">
                            ({Math.round(signatureFile.size / 1024)} KB)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 py-4 px-6">
                <Button type="submit" disabled={state.isPending || isSaving} className="ml-auto">
                  <Save className="mr-2 size-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Kolom Kanan: Status/Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="size-4 text-primary" />
                Template Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <Badge variant="default" className="mb-3">
                  Template Default PLN
                </Badge>
                <div className="h-32 w-24 border rounded shadow-sm bg-white mb-3" />
                <p className="text-sm font-medium">Sertifikat_Standar.pdf</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Menggunakan template bawaan sistem
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

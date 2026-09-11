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
import { CertificatePreviewDialog } from '@/components/organisms/certificate/CertificatePreviewDialog';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

export interface CertificateSettingSectionState {
  isPending: boolean;
  signerName: string;
  signerRole: string;
  signatureUrl?: string;
  signatureFileName?: string;
  templateUrl?: string;
  templateFileName?: string;
  isPreviewOpen: boolean;
}

export interface CertificateSettingSectionService {
  onSaveSettings: (data: {
    signerName: string;
    signerRole: string;
    signatureFile?: File;
    templateFile?: File;
  }) => Promise<void>;
  onResetTemplate?: () => void;
  onResetSignature?: () => void;
  onTogglePreview: (open: boolean) => void;
}

export interface CertificateSettingSectionProps {
  state: CertificateSettingSectionState;
  service: CertificateSettingSectionService;
}

export function CertificateSettingSection({ state, service }: CertificateSettingSectionProps) {
  const [signerName, setSignerName] = useState(state.signerName);
  const [signerRole, setSignerRole] = useState(state.signerRole);
  const [signatureFile, setSignatureFile] = useState<File | undefined>();
  const [templateFile, setTemplateFile] = useState<File | undefined>();
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSignerName(state.signerName);
  }, [state.signerName]);

  useEffect(() => {
    setSignerRole(state.signerRole);
  }, [state.signerRole]);

  // Handle signature file change and create temporary preview
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSignatureFile(file);
      if (signaturePreviewUrl) {
        URL.revokeObjectURL(signaturePreviewUrl);
      }
      setSignaturePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle template file change and create temporary preview
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTemplateFile(file);
      if (templatePreviewUrl) {
        URL.revokeObjectURL(templatePreviewUrl);
      }
      setTemplatePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearSignatureFile = () => {
    setSignatureFile(undefined);
    if (signaturePreviewUrl) {
      URL.revokeObjectURL(signaturePreviewUrl);
      setSignaturePreviewUrl(null);
    }
  };

  const handleClearTemplateFile = () => {
    setTemplateFile(undefined);
    if (templatePreviewUrl) {
      URL.revokeObjectURL(templatePreviewUrl);
      setTemplatePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await service.onSaveSettings({
        signerName,
        signerRole,
        signatureFile,
        templateFile,
      });
      // Clear temporary selected files after successful save
      setSignatureFile(undefined);
      setTemplateFile(undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveSignatureUrl = signaturePreviewUrl || state.signatureUrl;
  const effectiveTemplateUrl = templatePreviewUrl || state.templateUrl;
  const effectiveTemplateName = templateFile?.name || state.templateFileName;
  const hasCustomTemplate = !!effectiveTemplateUrl;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pengaturan Sertifikat</h1>
          <p className="text-sm text-muted-foreground">
            Kelola template sertifikat di Cloudflare R2, tanda tangan digital, dan data
            penandatangan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => service.onTogglePreview(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Eye className="size-4 text-primary" />
            Pratinjau Sertifikat
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Form Pengaturan */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card 1: Identitas Penandatangan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identitas Penandatangan</CardTitle>
                <CardDescription>
                  Informasi ini akan tercetak pada bagian tanda tangan di semua sertifikat magang
                  yang diterbitkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
                    placeholder="Contoh: Manager SDM & Umum"
                    disabled={state.isPending || isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Upload Tanda Tangan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Tanda Tangan</CardTitle>
                <CardDescription>
                  Tanda tangan digital pejabat berwenang yang akan diunggah ke penyimpanan
                  Cloudflare R2 (folder <code>signatures/</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active or Preview Signature Display */}
                {effectiveSignatureUrl && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-24 rounded border bg-white flex items-center justify-center overflow-hidden p-1 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={effectiveSignatureUrl}
                          alt="Pratinjau Tanda Tangan"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          {signatureFile ? 'File Baru Siap Disimpan' : 'Tanda Tangan Aktif'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {signatureFile?.name || state.signatureFileName || 'signature.png'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {signatureFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSignatureFile}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Batalkan
                        </Button>
                      ) : (
                        service.onResetSignature && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={service.onResetSignature}
                            className="text-destructive hover:bg-destructive/10 flex items-center gap-1 text-xs"
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Input Dropzone */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center hover:bg-muted/20 transition-colors">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 mb-3">
                    {signatureFile ? (
                      <ImageIcon className="size-5 text-primary" />
                    ) : (
                      <UploadCloud className="size-5 text-primary" />
                    )}
                  </div>
                  <label
                    htmlFor="signature-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-sm text-primary hover:underline focus-within:outline-none"
                  >
                    <span>
                      {signatureFile || state.signatureUrl
                        ? 'Ganti file tanda tangan'
                        : 'Unggah file tanda tangan'}
                    </span>
                    <Input
                      id="signature-upload"
                      name="signature-upload"
                      type="file"
                      accept="image/png, image/jpeg"
                      className="sr-only"
                      onChange={handleSignatureChange}
                      disabled={state.isPending || isSaving}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format PNG atau JPG (Maks. 2MB). Disarankan berlatar belakang transparan.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Upload Template Sertifikat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Sertifikat</CardTitle>
                <CardDescription>
                  Ganti desain template sertifikat dengan mengunggah file baru ke Cloudflare R2
                  (folder <code>certificate-templates/</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active Template Display */}
                {hasCustomTemplate && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          {templateFile ? 'Template Baru Siap Diunggah' : 'Template Kustom Aktif'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {effectiveTemplateName || 'template.pdf'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {templateFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearTemplateFile}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Batalkan
                        </Button>
                      ) : (
                        service.onResetTemplate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={service.onResetTemplate}
                            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                          >
                            <RotateCcw className="size-3.5" />
                            Default PLN
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Input Dropzone */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center hover:bg-muted/20 transition-colors">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 mb-3">
                    {templateFile ? (
                      <FileCheck className="size-5 text-primary" />
                    ) : (
                      <UploadCloud className="size-5 text-primary" />
                    )}
                  </div>
                  <label
                    htmlFor="template-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-sm text-primary hover:underline focus-within:outline-none"
                  >
                    <span>
                      {hasCustomTemplate
                        ? 'Ganti template sertifikat'
                        : 'Unggah template sertifikat'}
                    </span>
                    <Input
                      id="template-upload"
                      name="template-upload"
                      type="file"
                      accept=".pdf, image/png, image/jpeg"
                      className="sr-only"
                      onChange={handleTemplateChange}
                      disabled={state.isPending || isSaving}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format PDF, PNG, atau JPG (Maks. 10MB). Format PDF A4 landscape sangat
                    disarankan.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/40 py-4 px-6 flex items-center justify-between border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => service.onTogglePreview(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="size-4 text-muted-foreground" />
                  Pratinjau Hasil
                </Button>
                <Button type="submit" disabled={state.isPending || isSaving} className="ml-auto">
                  <Save className="mr-2 size-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Kolom Kanan: Status & Live Summary */}
        <div className="space-y-6">
          {/* Card Status Template */}
          <Card>
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="size-4 text-primary" />
                Status Template Sertifikat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
                <Badge
                  variant={hasCustomTemplate ? 'default' : 'secondary'}
                  className="mb-3 text-xs"
                >
                  {hasCustomTemplate ? 'Template Kustom (Cloudflare R2)' : 'Template Default PLN'}
                </Badge>

                <div className="h-32 w-48 rounded-lg border border-border bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center p-2 mb-3 relative overflow-hidden group">
                  <Award className="size-10 text-amber-500/70 mb-1" />
                  <span className="text-[10px] font-bold text-foreground tracking-wider uppercase">
                    Sertifikat Magang
                  </span>
                  <span className="text-[9px] text-muted-foreground">PT PLN (Persero)</span>
                </div>

                <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                  {effectiveTemplateName || 'Template_Sertifikat_PLN.pdf'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {hasCustomTemplate ? 'Disimpan di Cloudflare R2' : 'Template bawaan sistem'}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => service.onTogglePreview(true)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs"
                >
                  <Eye className="size-3.5 text-primary" />
                  Buka Pratinjau Sertifikat
                </Button>
              </div>

              {state.templateUrl && (
                <div className="pt-2 border-t">
                  <a
                    href={state.templateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-primary hover:underline"
                  >
                    <span>Lihat file template di R2</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Penandatangan Aktif */}
          <Card>
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Blok Tanda Tangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center text-center shadow-xs">
                <span className="text-xs text-muted-foreground">Jakarta, 11 September 2026</span>
                <span className="text-xs font-semibold text-foreground mt-0.5">
                  {signerRole || 'Manager SDM'}
                </span>

                <div className="h-16 flex items-center justify-center my-2">
                  {effectiveSignatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={effectiveSignatureUrl}
                      alt="Tanda Tangan"
                      className="max-h-14 max-w-[140px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center border-b border-dashed border-muted-foreground/40 px-4 py-1.5">
                      <span className="text-[10px] text-muted-foreground italic">
                        (Belum ada tanda tangan)
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-xs font-bold text-foreground underline underline-offset-4">
                  {signerName || 'Budi Santoso, S.T., M.T.'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  NIP. 197804122002121001
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Certificate Preview Dialog */}
      <CertificatePreviewDialog
        open={state.isPreviewOpen}
        onOpenChange={service.onTogglePreview}
        signerName={signerName}
        signerRole={signerRole}
        signatureUrl={effectiveSignatureUrl}
        templateUrl={effectiveTemplateUrl}
        templateFileName={effectiveTemplateName}
      />
    </section>
  );
}

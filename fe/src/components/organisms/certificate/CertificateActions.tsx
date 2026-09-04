import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import { Download, ExternalLink, Shield } from 'lucide-react';

export interface CertificateActionsProps {
  certificateId: string;
  certificateNumber: string;
  verificationToken: string;
  isDownloading?: boolean;
  onDownload: (certificateId: string, certificateNumber: string) => void;
}

/**
 * Action buttons for certificate (download, verify, etc.)
 */
export function CertificateActions({
  certificateId,
  certificateNumber,
  verificationToken,
  isDownloading,
  onDownload,
}: CertificateActionsProps) {
  const verifyUrl = `${window.location.origin}/verify/${verificationToken}`;

  const handleCopyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    // Could add toast notification here
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Primary Download Button */}
        <Button
          onClick={() => onDownload(certificateId, certificateNumber)}
          disabled={isDownloading}
          size="lg"
          className="w-full"
        >
          {isDownloading ? (
            <>
              <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="mr-2 size-4" />
              Unduh Sertifikat PDF
            </>
          )}
        </Button>

        {/* Verification Section */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="size-4" />
            <span className="font-medium">Verifikasi Keaslian</span>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Kode Verifikasi:</p>
            <code className="block text-xs font-mono bg-background px-3 py-2 rounded border break-all">
              {verificationToken}
            </code>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCopyVerifyLink}
          >
            <ExternalLink className="mr-2 size-3.5" />
            Salin Link Verifikasi
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Gunakan kode di atas untuk memverifikasi keaslian sertifikat
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

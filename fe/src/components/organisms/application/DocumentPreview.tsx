'use client';

import { Button } from '@/components/atoms/button';
import { getFilePreviewUrl } from '@/utils/file-preview';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { useState } from 'react';

export const DOCUMENT_LABELS: Record<string, string> = {
  CV: 'Curriculum Vitae (CV)',
  FACULTY_REQUEST_LETTER: 'Surat Permohonan Fakultas',
};

export interface DocumentPreviewFile {
  originalName: string;
  url?: string | null;
  id?: string;
}

/**
 * Kartu pratinjau satu dokumen (embed PDF + tombol tab baru).
 * State buka/tutup dipegang masing-masing kartu.
 */
export function DocumentPreview({
  subtitle,
  file,
  defaultOpen = true,
}: {
  subtitle: string;
  file: DocumentPreviewFile;
  defaultOpen?: boolean;
}) {
  const [showPdfPreview, setShowPdfPreview] = useState(defaultOpen);
  const previewUrl = getFilePreviewUrl(file);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 bg-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="size-5 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">{file.originalName}</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPdfPreview((prev) => !prev)}>
            {showPdfPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showPdfPreview ? 'Tutup Pratinjau' : 'Pratinjau PDF'}
          </Button>
          {previewUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={previewUrl} target="_blank" rel="noreferrer">
                Buka di Tab Baru
              </a>
            </Button>
          )}
        </div>
      </div>

      {showPdfPreview && previewUrl && (
        <div className="mt-2 w-full overflow-hidden rounded-lg border border-border bg-muted/10 shadow-inner">
          <iframe
            src={previewUrl}
            className="h-[520px] w-full border-0"
            title={`Pratinjau ${file.originalName}`}
          />
        </div>
      )}
    </div>
  );
}

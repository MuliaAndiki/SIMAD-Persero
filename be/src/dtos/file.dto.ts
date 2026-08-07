import { MAX_FILE_SIZE } from '@/utils/storage.util';
import { t } from 'elysia';

/**
 * DTO (Data Transfer Object) modul File.
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih
 * dan skema bisa dipakai ulang / diuji secara terpisah.
 * Sumber aturan: docs/07-api-specification.md §25.
 */

// POST /files/upload
export const UploadFileDto = t.Object({
  file: t.File({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: MAX_FILE_SIZE,
    description: 'File PDF/JPG/JPEG/PNG maksimal 5 MB',
  }),
});

// GET /files/:fileId, GET /files/:fileId/download, DELETE /files/:fileId
export const FileParamsDto = t.Object({
  fileId: t.String({ description: 'ID file' }),
});

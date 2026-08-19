import type { AppContext } from '@/contex';
import FileController from '@/controllers/FileController';
import { FileParamsDto, UploadFileDto } from '@/dtos/file.dto';
import { verifyToken } from '@/middlewares/auth';
import { RateLimitRule, keyByUser, rateLimit } from '@/middlewares/rateLimit';
import Elysia from 'elysia';

/**
 * Routes modul File.
 * Base URL: /files
 * Sumber aturan: docs/07-api-specification.md §25.
 * Seluruh endpoint membutuhkan Bearer Token (user yang sudah login).
 */
class FileRouter {
  public fileRouter;

  constructor() {
    this.fileRouter = new Elysia({ prefix: '/files' });
    this.routes();
  }

  private routes() {
    // POST /files/upload
    this.fileRouter.post('/upload', (c: AppContext) => FileController.upload(c), {
      body: UploadFileDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        rateLimit({ ...RateLimitRule.UPLOAD, keyGenerator: keyByUser }).beforeHandle,
      ],
      detail: {
        summary: 'Upload file',
        description: 'Upload file PDF/JPG/JPEG/PNG maksimal 5 MB (multipart/form-data).',
        tags: ['File'],
      },
    });

    // GET /files/:fileId
    this.fileRouter.get('/:fileId', (c: AppContext) => FileController.detail(c), {
      params: FileParamsDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Detail file',
        description: 'Mengembalikan metadata file berdasarkan ID.',
        tags: ['File'],
      },
    });

    // GET /files/:fileId/download
    this.fileRouter.get('/:fileId/download', (c: AppContext) => FileController.download(c), {
      params: FileParamsDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Unduh file',
        description: 'Mengunduh konten file berdasarkan ID.',
        tags: ['File'],
      },
    });

    // DELETE /files/:fileId
    this.fileRouter.delete('/:fileId', (c: AppContext) => FileController.remove(c), {
      params: FileParamsDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Hapus file',
        description: 'Menghapus file (soft delete via deleted_at) oleh pemilik file atau HR_ADMIN.',
        tags: ['File'],
      },
    });
  }
}

export default new FileRouter().fileRouter;

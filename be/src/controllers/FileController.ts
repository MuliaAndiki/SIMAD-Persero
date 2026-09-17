import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import FileService from '@/services/file.service';
import type { FileParams } from '@/types/file.types';

/**
 * Controller modul File — tipis.
 * Mengekstrak input dari context (body/params/user), memanggil
 * `FileService`, lalu memetakan hasil ke respons HTTP menggunakan
 * helper resmi `HttpResponse` dari `@/http`.
 * Sumber aturan: docs/07-api-specification.md §25.
 */
class FileController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // POST /files/upload
  public async upload(c: AppContext) {
    try {
      const user = c.user!;
      const body = (c.body || {}) as {
        file?: File;
        url?: string;
        originalName?: string;
        mimeType?: string;
        size?: number;
      };

      if (body.url) {
        const data = await FileService.saveUrl(user.id, {
          url: body.url,
          originalName: body.originalName || 'file',
          mimeType: body.mimeType || 'application/octet-stream',
          size: body.size,
        });
        return HttpResponse(c).created(data, 'File registered successfully');
      }

      const file = body.file;
      if (!file) {
        return HttpResponse(c).unprocessable('File or URL is required');
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await FileService.upload(user.id, {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        buffer,
      });

      return HttpResponse(c).created(data, 'File uploaded successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /files/:fileId
  public async detail(c: AppContext) {
    try {
      const { fileId } = c.params as unknown as FileParams;
      const data = await FileService.getById(fileId);
      return HttpResponse(c).ok(data, undefined, 'File retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /files/:fileId/download — stream file langsung dari R2 (attachment).
  public async download(c: AppContext) {
    try {
      const { fileId } = c.params as unknown as FileParams;
      const { file, stream, contentType, contentLength } = await FileService.getFileStream(fileId);

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.originalName || 'downloaded-file'}"`,
        'Accept-Ranges': 'bytes',
      };
      if (contentLength) {
        headers['Content-Length'] = String(contentLength);
      }

      return new Response(stream, { status: 200, headers });
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /files/:fileId/view — stream file inline untuk preview browser/iframe.
  public async view(c: AppContext) {
    try {
      const { fileId } = c.params as unknown as FileParams;
      const { file, stream, contentType, contentLength } = await FileService.getFileStream(fileId);

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${file.originalName || 'file'}"`,
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      };
      if (contentLength) {
        headers['Content-Length'] = String(contentLength);
      }

      return new Response(stream, { status: 200, headers });
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /files/:fileId
  public async remove(c: AppContext) {
    try {
      const user = c.user!;
      const { fileId } = c.params as unknown as FileParams;
      await FileService.remove(fileId, user);
      return HttpResponse(c).ok(undefined, undefined, 'File deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new FileController();

import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import FileService from '@/services/file.service';
import type { FileParams } from '@/types/file.types';
import type { UploadR2Folder } from '@/utils/r2-utils';
import { inferMimeFromFilename } from '@/utils/storage.util';

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

  private streamFileResponse({
    stream,
    contentType,
    contentLength,
    dispositionType,
    filename,
    cacheControl,
  }: {
    stream: ReadableStream;
    contentType: string;
    contentLength?: number;
    dispositionType: 'inline' | 'attachment';
    filename: string;
    cacheControl?: string;
  }) {
    const safeFilename = filename.replace(/["\r\n]/g, '_');
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `${dispositionType}; filename="${safeFilename}"`,
      'Accept-Ranges': 'bytes',
    };
    if (contentLength) {
      headers['Content-Length'] = String(contentLength);
    }
    if (cacheControl) {
      headers['Cache-Control'] = cacheControl;
    }
    return new Response(stream, { status: 200, headers });
  }

  // POST /files/upload
  public async upload(c: AppContext) {
    try {
      const user = c.user!;
      const body = (c.body || {}) as {
        file?: File;
        folder?: UploadR2Folder;
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
      const mimeType =
        file.type && file.type !== 'application/octet-stream'
          ? file.type
          : inferMimeFromFilename(file.name);

      const data = await FileService.upload(user.id, {
        originalName: file.name,
        mimeType,
        size: file.size,
        buffer,
        folder: body.folder,
      });

      return HttpResponse(c).created(data, 'File uploaded successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /files/preview — stream file inline/attachment berdasar key, url, atau fileId
  public async preview(c: AppContext) {
    try {
      const query = (c.query || {}) as {
        key?: string;
        url?: string;
        fileId?: string;
        download?: string;
      };
      const result = await FileService.getPreviewStream(query);
      const isDownload = query.download === 'true';

      return this.streamFileResponse({
        stream: result.stream,
        contentType: result.contentType,
        contentLength: result.contentLength,
        dispositionType: isDownload ? 'attachment' : 'inline',
        filename: result.filename,
        cacheControl: isDownload
          ? undefined
          : 'public, max-age=86400, stale-while-revalidate=3600',
      });
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

      return this.streamFileResponse({
        stream,
        contentType,
        contentLength,
        dispositionType: 'attachment',
        filename: file.originalName || 'downloaded-file',
      });
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /files/:fileId/view — stream file inline untuk preview browser/iframe.
  public async view(c: AppContext) {
    try {
      const { fileId } = c.params as unknown as FileParams;
      const { file, stream, contentType, contentLength } = await FileService.getFileStream(fileId);

      return this.streamFileResponse({
        stream,
        contentType,
        contentLength,
        dispositionType: 'inline',
        filename: file.originalName || 'file',
        cacheControl: 'public, max-age=86400',
      });
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

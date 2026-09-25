import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import GuideService from '@/services/guide.service';
import type { CreateGuideBody, GuideQuery, UpdateGuideBody } from '@/types/guide.types';

class GuideController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /guides (Public / Authenticated)
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as GuideQuery;
      const isHrAdmin = (c.user?.roles || []).some((r: string) => r.toLowerCase() === 'hr_admin');
      const data = await GuideService.list(query, isHrAdmin);
      return HttpResponse(c).ok(data, undefined, 'Daftar panduan berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /guides/:slug
  public async getBySlug(c: AppContext) {
    try {
      const { slug } = c.params;
      const isHrAdmin = (c.user?.roles || []).some((r: string) => r.toLowerCase() === 'hr_admin');
      const data = await GuideService.getBySlug(slug, isHrAdmin);
      return HttpResponse(c).ok(data, undefined, 'Detail panduan berhasil dimuat');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /guides (HR Admin)
  public async create(c: AppContext) {
    try {
      const body = c.body as CreateGuideBody;
      const data = await GuideService.create(body);
      return HttpResponse(c).created(data, 'Panduan berhasil ditambahkan');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /guides/:id (HR Admin)
  public async update(c: AppContext) {
    try {
      const { id } = c.params;
      const body = c.body as UpdateGuideBody;
      const data = await GuideService.update(id, body);
      return HttpResponse(c).ok(data, undefined, 'Panduan berhasil diperbarui');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /guides/:id (HR Admin)
  public async remove(c: AppContext) {
    try {
      const { id } = c.params;
      const data = await GuideService.remove(id);
      return HttpResponse(c).ok(data, undefined, 'Panduan berhasil dihapus');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new GuideController();

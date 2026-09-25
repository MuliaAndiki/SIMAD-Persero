import { BadRequestError, NotFoundError } from '@/http/error';
import type { CreateGuideBody, GuideQuery, UpdateGuideBody } from '@/types/guide.types';
import prisma from '../../prisma/client';

class GuideService {
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Mengambil daftar panduan & video tutorial (publik/authenticated).
   */
  public async list(query: GuideQuery, isHrAdmin = false) {
    const where: any = {};

    if (!isHrAdmin) {
      where.isPublished = true;
    } else if (query.isPublished !== undefined) {
      where.isPublished = String(query.isPublished) === 'true';
    }

    if (query.category) {
      where.category = query.category.toUpperCase();
    }

    if (query.keyword) {
      const kw = query.keyword.trim();
      where.OR = [
        { title: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { content: { contains: kw, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.guideContent.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return items;
  }

  /**
   * Mengambil detail panduan berdasarkan slug atau ID.
   */
  public async getBySlug(slugOrId: string, isHrAdmin = false) {
    const guide = await prisma.guideContent.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
    });

    if (!guide) {
      throw new NotFoundError('Konten panduan tidak ditemukan');
    }

    if (!guide.isPublished && !isHrAdmin) {
      throw new NotFoundError('Konten panduan belum dipublikasikan');
    }

    return guide;
  }

  /**
   * Menambahkan konten panduan baru (HR Admin).
   */
  public async create(body: CreateGuideBody) {
    let slug = body.slug?.trim() || this.generateSlug(body.title);

    // Pastikan slug unik
    const existing = await prisma.guideContent.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const created = await prisma.guideContent.create({
      data: {
        title: body.title.trim(),
        slug,
        description: body.description?.trim() || null,
        videoUrl: body.videoUrl?.trim() || null,
        content: body.content,
        category: body.category.toUpperCase(),
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
        isPublished: body.isPublished ?? true,
      },
    });

    return created;
  }

  /**
   * Memperbarui konten panduan (HR Admin).
   */
  public async update(id: string, body: UpdateGuideBody) {
    const existing = await prisma.guideContent.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Konten panduan tidak ditemukan');
    }

    const updateData: any = {};
    if (body.title) updateData.title = body.title.trim();
    if (body.slug) updateData.slug = body.slug.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl?.trim() || null;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category) updateData.category = body.category.toUpperCase();
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);

    const updated = await prisma.guideContent.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  /**
   * Menghapus konten panduan (HR Admin).
   */
  public async remove(id: string) {
    const existing = await prisma.guideContent.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Konten panduan tidak ditemukan');
    }

    await prisma.guideContent.delete({ where: { id } });
    return { message: 'Konten panduan berhasil dihapus' };
  }
}

export default new GuideService();

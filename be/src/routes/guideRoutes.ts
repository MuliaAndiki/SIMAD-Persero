import type { AppContext } from '@/contex';
import guideController from '@/controllers/GuideController';
import {
  CreateGuideDto,
  GuideIdParam,
  GuideListQuery,
  GuideSlugParam,
  UpdateGuideDto,
} from '@/dtos/guide.dto';
import { optionalAuth, requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

class GuideRouter {
  public guideRouter;

  constructor() {
    this.guideRouter = new Elysia({ prefix: '/guides' });
    this.routes();
  }

  private routes() {
    // GET /guides (Public / Authenticated)
    this.guideRouter.get(
      '/',
      (c: AppContext) => guideController.list(c),
      {
        beforeHandle: [optionalAuth().beforeHandle],
        query: GuideListQuery,
      },
    );

    // GET /guides/:slug (Public / Authenticated)
    this.guideRouter.get(
      '/:slug',
      (c: AppContext) => guideController.getBySlug(c),
      {
        beforeHandle: [optionalAuth().beforeHandle],
        params: GuideSlugParam,
      },
    );

    // POST /guides (HR Admin)
    this.guideRouter.post(
      '/',
      (c: AppContext) => guideController.create(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        body: CreateGuideDto,
      },
    );

    // PATCH /guides/:id (HR Admin)
    this.guideRouter.patch(
      '/:id',
      (c: AppContext) => guideController.update(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: GuideIdParam,
        body: UpdateGuideDto,
      },
    );

    // DELETE /guides/:id (HR Admin)
    this.guideRouter.delete(
      '/:id',
      (c: AppContext) => guideController.remove(c),
      {
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        params: GuideIdParam,
      },
    );
  }
}

export default new GuideRouter().guideRouter;

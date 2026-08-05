import type { AppFile } from '@/types/app.types';
import type { JwtPayload } from '@/types/auth.types';
import type { RequestStore } from '@/types/request.type';
import type { Context } from 'elysia';

export interface AppContext extends Omit<Context, 'body' | 'query' | 'params'> {
  user?: JwtPayload;
  json?: (data: unknown, status?: number) => Response;
  files?: Record<string, AppFile[]>;
  body: unknown;
  query: Record<string, unknown>;
  params: Record<string, string>;
  store: RequestStore;
}

export type ElysiaHandler = (c: AppContext) => Promise<Response | undefined> | Response | undefined;
export type ElysiaMiddleware = (
  c: AppContext,
) => Promise<undefined | Response> | undefined | Response;

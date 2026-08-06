import { APP_SESSION_COOKIE_KEY } from '../../config/cookies.config';
import { baseurl } from '../../config/repo.config';
import { ApiError as ApiErrorClass, type ApiSuccessResponse } from '../../types/api.types';

export interface ClientRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

type ClientFetchOptions = {
  withAuth: boolean;
};

type TokenProvider = () => string | undefined | Promise<string | undefined>;
type BaseURLProvider = () => string | undefined | Promise<string | undefined>;
type AuthErrorHandler = (status: number) => void;

let _tokenProvider: TokenProvider | null = null;
let _baseURLProvider: BaseURLProvider | null = null;
let _authErrorHandler: AuthErrorHandler | null = null;

export const setTokenProvider = (provider: TokenProvider) => {
  _tokenProvider = provider;
};

export const setBaseURLProvider = (provider: BaseURLProvider) => {
  _baseURLProvider = provider;
};

/**
 * Override the default 401 handling (hard `window.location.href = "/login"`).
 * The handler is responsible for clearing the stale session and navigating.
 * Pass `null` to restore the default behavior.
 */
export const setAuthErrorHandler = (handler: AuthErrorHandler | null) => {
  _authErrorHandler = handler;
};

async function buildApiUrl(path: string): Promise<string> {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  let base = baseurl;
  if (_baseURLProvider) {
    const customBase = await _baseURLProvider();
    if (customBase) base = customBase;
  }

  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildBaseHeaders(accessToken?: string): Record<string, string> {
  const internalApiKey =
    process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ||
    process.env.NEXT_INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_KEY ||
    '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-api-key': internalApiKey,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function getAccessToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${APP_SESSION_COOKIE_KEY}=`));

  if (!match) return undefined;

  const value = match.slice(APP_SESSION_COOKIE_KEY.length + 1);
  return value || undefined;
}

async function clientCoreFetchResponse<T>(
  path: string,
  config: ClientRequestConfig = {},
  options: ClientFetchOptions = { withAuth: true },
): Promise<ApiSuccessResponse<T>> {
  const { method = 'GET', body, headers: extraHeaders = {}, cache = 'no-store' } = config;

  let accessToken: string | undefined = undefined;
  if (options.withAuth) {
    if (_tokenProvider) {
      accessToken = await _tokenProvider();
    } else {
      accessToken = getAccessToken();
    }
  }

  const endpoint = await buildApiUrl(path);

  const res = await fetch(endpoint, {
    method,
    headers: {
      ...buildBaseHeaders(accessToken),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    cache,
  });

  let json: ApiSuccessResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiErrorClass(`Request failed with status ${res.status}`, res.status);
  }

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && typeof window !== 'undefined') {
      if (_authErrorHandler) {
        _authErrorHandler(res.status);
      } else {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    throw new ApiErrorClass(
      json?.message ?? `Request failed with status ${res.status}`,
      res.status,
      json?.errors,
    );
  }

  return json;
}

async function clientCoreFetch<T>(
  path: string,
  config?: ClientRequestConfig,
  options?: ClientFetchOptions,
): Promise<T> {
  const json = await clientCoreFetchResponse<T>(path, config, options);
  return json.data;
}

export async function ClientGetResponse<T>(path: string): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'GET' });
}

export async function ClientPostResponse<T>(
  path: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'POST', body: data });
}

export async function ClientPatchResponse<T>(
  path: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'PATCH', body: data });
}

export async function ClientPutResponse<T>(
  path: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'PUT', body: data });
}

export async function ClientDelResponse<T>(path: string): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'DELETE' });
}

export async function ClientPublicGetResponse<T>(path: string): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'GET' }, { withAuth: false });
}

export async function ClientPublicPostResponse<T>(
  path: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  return clientCoreFetchResponse<T>(path, { method: 'POST', body: data }, { withAuth: false });
}

export async function ClientDel<T>(path: string): Promise<T> {
  return clientCoreFetch<T>(path, { method: 'DELETE' });
}

export async function ClientGet<T>(path: string): Promise<T> {
  return clientCoreFetch<T>(path, { method: 'GET' });
}

export async function ClientPost<T>(path: string, data?: unknown): Promise<T> {
  return clientCoreFetch<T>(path, { method: 'POST', body: data });
}

export const GetResponse = ClientGetResponse;
export const PostResponse = ClientPostResponse;
export const PutResponse = ClientPutResponse;
export const PatchResponse = ClientPatchResponse;
export const DelResponse = ClientDelResponse;
export const DeleteResponse = ClientDelResponse;
export const PublicGetResponse = ClientPublicGetResponse;
export const PublicPostResponse = ClientPublicPostResponse;

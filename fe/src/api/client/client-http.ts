import { refreshAccessToken } from '@/api/client/auth-refresh';
import { AUTH_ENDPOINTS } from '@/configs/endpoints/auth.endpoints';
import { baseurl } from '@/configs/repo.config';
import { clearSessionCookies, getAccessToken } from '@/utils/session-cookie';
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

function extractErrorMessage(resStatus: number, json: any): string {
  if (typeof json?.message === 'string' && json.message.trim() !== '') {
    return json.message;
  }
  if (typeof json?.error === 'string' && json.error.trim() !== '') {
    return json.error;
  }
  if (typeof json?.summary === 'string' && json.summary.trim() !== '') {
    return json.summary;
  }
  if (Array.isArray(json?.errors) && json.errors[0]?.message) {
    return json.errors[0].message;
  }
  if (resStatus === 503) {
    return 'Gagal terhubung ke database. Silakan coba beberapa saat lagi.';
  }
  if (resStatus === 401) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  if (resStatus === 403) {
    return 'Akses ditolak. Anda tidak memiliki izin.';
  }
  if (resStatus === 404) {
    return 'Data atau layanan tidak ditemukan.';
  }
  return `Permintaan gagal dengan status ${resStatus}`;
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

  const isAuthRefresh = path.includes(AUTH_ENDPOINTS.REFRESH_TOKEN);

  let res = await fetch(endpoint, {
    method,
    headers: {
      ...buildBaseHeaders(accessToken),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    cache,
  });

  // 401 pada request ber-auth: tukar refresh token -> access token baru,
  // lalu ulangi request sekali. Bila gagal, cookie dibersihkan & dialihkan.
  if (res.status === 401 && options.withAuth && !isAuthRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      res = await fetch(endpoint, {
        method,
        headers: {
          ...buildBaseHeaders(getAccessToken()),
          ...extraHeaders,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
        cache,
      });
    }
  }

  let json: ApiSuccessResponse<T> | any;
  try {
    json = await res.json();
  } catch {
    throw new ApiErrorClass(extractErrorMessage(res.status, null), res.status);
  }

  if (!res.ok || json?.success === false || (json?.status && json.status >= 400)) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearSessionCookies();

      if (_authErrorHandler) {
        _authErrorHandler(res.status);
      } else {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    const errorMessage = extractErrorMessage(res.status, json);
    throw new ApiErrorClass(errorMessage, res.status, json?.errors);
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

/**
 * POST multipart/form-data (upload file).
 *
 * Tidak menggunakan `clientCoreFetchResponse` karena body harus dikirim
 * sebagai `FormData` (bukan `JSON.stringify`), dan header `Content-Type`
 * harus dihilangkan agar browser meng-generate boundary secara otomatis.
 */
export async function ClientPostFormDataResponse<T>(
  path: string,
  formData: FormData,
): Promise<ApiSuccessResponse<T>> {
  let accessToken: string | undefined = undefined;
  if (_tokenProvider) {
    accessToken = await _tokenProvider();
  } else {
    accessToken = getAccessToken();
  }

  const endpoint = await buildApiUrl(path);

  const internalApiKey =
    process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ||
    process.env.NEXT_INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_KEY ||
    '';

  const headers: Record<string, string> = {
    'x-internal-api-key': internalApiKey,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  let json: ApiSuccessResponse<T> | any;
  try {
    json = await res.json();
  } catch {
    throw new ApiErrorClass(extractErrorMessage(res.status, null), res.status);
  }

  if (!res.ok || json?.success === false || (json?.status && json.status >= 400)) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearSessionCookies();

      if (_authErrorHandler) {
        _authErrorHandler(res.status);
      } else {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    const errorMessage = extractErrorMessage(res.status, json);
    throw new ApiErrorClass(errorMessage, res.status, json?.errors);
  }

  return json;
}

/**
 * GET binary download (file / certificate).
 *
 * Mengembalikan `Response` mentah (bukan JSON) sehingga caller dapat
 * mengekstrak blob, header Content-Disposition, dsb.
 */
export async function ClientDownloadResponse(path: string): Promise<Response> {
  let accessToken: string | undefined = undefined;
  if (_tokenProvider) {
    accessToken = await _tokenProvider();
  } else {
    accessToken = getAccessToken();
  }

  const endpoint = await buildApiUrl(path);

  const internalApiKey =
    process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ||
    process.env.NEXT_INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_KEY ||
    '';

  const headers: Record<string, string> = {
    'x-internal-api-key': internalApiKey,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(endpoint, {
    method: 'GET',
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearSessionCookies();

      if (_authErrorHandler) {
        _authErrorHandler(res.status);
      } else {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    throw new ApiErrorClass(`Download failed with status ${res.status}`, res.status);
  }

  return res;
}

export const GetResponse = ClientGetResponse;
export const PostResponse = ClientPostResponse;
export const PutResponse = ClientPutResponse;
export const PatchResponse = ClientPatchResponse;
export const DelResponse = ClientDelResponse;
export const DeleteResponse = ClientDelResponse;
export const PublicGetResponse = ClientPublicGetResponse;
export const PublicPostResponse = ClientPublicPostResponse;
export const PostFormDataResponse = ClientPostFormDataResponse;
export const DownloadResponse = ClientDownloadResponse;

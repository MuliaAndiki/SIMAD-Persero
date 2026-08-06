/**
 * Entry method API.
 *
 * `Api()` adalah pintu masuk seluruh method fetch frontend, dibedakan
 * berdasarkan lingkungan eksekusi:
 * - `client` → fe/src/api/client/client-http.ts (dieksekusi di browser,
 *   token dibaca dari cookie via `document.cookie`).
 * - `server` → fe/src/api/server/server-fetch.ts (dieksekusi di server,
 *   cookie httpOnly via `next/headers`, lengkap dengan rotasi refresh token
 *   dan redirect ke /login saat 401).
 *
 * Service (fe/src/services/api/*) mengambil method lewat sini, misal:
 *   const { client } = Api();
 *   const res = await client.PublicPostResponse('/auth/login', body);
 */
import {
  ClientDelResponse,
  ClientGetResponse,
  ClientPatchResponse,
  ClientPostResponse,
  ClientPublicGetResponse,
  ClientPublicPostResponse,
  ClientPutResponse,
} from '@/api/client/client-http';
import {
  DelResponse,
  GetResponse,
  PatchResponse,
  PostResponse,
  PublicGetResponse,
  PublicPostResponse,
  PutResponse,
} from '@/api/server/server-fetch';

export function Api() {
  return {
    client: {
      GetResponse: ClientGetResponse,
      PostResponse: ClientPostResponse,
      PatchResponse: ClientPatchResponse,
      PutResponse: ClientPutResponse,
      DeleteResponse: ClientDelResponse,
      PublicGetResponse: ClientPublicGetResponse,
      PublicPostResponse: ClientPublicPostResponse,
    },
    server: {
      GetResponse,
      PostResponse,
      PatchResponse,
      PutResponse,
      DeleteResponse: DelResponse,
      PublicGetResponse,
      PublicPostResponse,
    },
  };
}

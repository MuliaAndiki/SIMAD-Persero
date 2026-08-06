/**
 * Base URL API gateway.
 *
 * Dibangun dari:
 * - NEXT_PUBLIC_BACKEND_URL  (mis. http://localhost:5000)
 * - NEXT_PUBLIC_GATE_API     (mis. /api)
 * - NEXT_PUBLIC_VERSION_API  (mis. /v1)
 *
 * Dipakai oleh lapisan fetch (fe/src/api/client/client-http.ts).
 */
export const baseurl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${process.env.NEXT_PUBLIC_GATE_API || '/api'}${process.env.NEXT_PUBLIC_VERSION_API || '/v1'}`;

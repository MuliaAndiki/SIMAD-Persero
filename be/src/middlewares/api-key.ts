import crypto from 'node:crypto';

export const InternalApiKey = (app: any) => {
  app.onBeforeHandle(({ headers, set }: { headers: Record<string, any>; set: any }) => {
    try {
      const rawKey = headers['.'] ?? headers['x-internal-api-key'];
      const clientKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;

      const serverKey = process.env.INTERNAL_API_SECRET;

      if (!clientKey) {
        set.status = 401;
        return {
          status: 401,
          message: 'Kunci API internal tidak ditemukan',
        };
      }

      if (!serverKey) {
        throw new Error('INTERNAL_API_SECRET is not defined');
      }

      const clientBuffer = Buffer.from(String(clientKey));
      const serverBuffer = Buffer.from(String(serverKey));

      if (clientBuffer.length !== serverBuffer.length) {
        set.status = 403;
        return {
          status: 403,
          message: 'Kunci API internal tidak valid',
        };
      }

      const isMatch = crypto.timingSafeEqual(clientBuffer, serverBuffer);

      if (!isMatch) {
        set.status = 403;
        return {
          status: 403,
          message: 'Kunci API internal tidak valid',
        };
      }
    } catch (_error) {
      set.status = 500;
      return {
        status: 500,
        message: 'Terjadi kesalahan autentikasi API internal',
      };
    }
  });

  return app;
};

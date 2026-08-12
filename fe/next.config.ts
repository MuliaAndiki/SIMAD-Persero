import { env } from "@/configs/env.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: env.NEXT_PUBLIC_BASEPATH || "/home",
        permanent: true,
      },
      // Email backend memakai prefiks /auth (mis. /auth/verify-email?token=...,
      // /auth/magic-link?token=..., /auth/reset-password?token=...), sedangkan
      // halaman FE berada di route group (auth) tanpa prefiks (/verify-email).
      // Query string (?token=...) otomatis dipertahankan.
      {
        source: "/auth/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

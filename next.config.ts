import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Account tests run alongside the developer's server with their own build cache.
  distDir: process.env.SHERLOCK_ACCOUNT_TEST_DB ? ".next-accounts" : ".next",
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  serverExternalPackages: ["better-sqlite3"],
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn4.telesco.pe" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;

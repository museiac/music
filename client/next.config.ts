import type { NextConfig } from "next";

/**
 * The Next.js dev/prod server proxies same-origin "/api/*" requests
 * server-to-server to the Express backend. This keeps the default browser
 * path same-origin while the backend also allows the local client origin.
 *
 * The frontend API client (src/lib/api.ts) always calls NEXT_PUBLIC_API_URL,
 * so this proxy is transparent: set NEXT_PUBLIC_API_URL="/api" (the default
 * in .env.example) to use it, or point NEXT_PUBLIC_API_URL at the backend
 * directly for local development.
 */
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:3000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * The existing Express backend (backend/src/app.ts) does not register any
 * CORS middleware, and this project must not modify the backend. To let the
 * browser call the API without being blocked by CORS, the Next.js dev/prod
 * server proxies same-origin "/api/*" requests server-to-server to the real
 * backend (server-to-server requests are never subject to browser CORS).
 *
 * The frontend API client (src/lib/api.ts) always calls NEXT_PUBLIC_API_URL,
 * so this proxy is transparent: set NEXT_PUBLIC_API_URL="/api" (the default
 * in .env.example) to use it, or point NEXT_PUBLIC_API_URL at an absolute
 * backend URL later if the backend adds its own CORS support.
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

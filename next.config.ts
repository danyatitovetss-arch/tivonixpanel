import type { NextConfig } from "next";

const internalApiUrl = process.env.INTERNAL_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!internalApiUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

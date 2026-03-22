import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase serverless function timeout for large data generation requests
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Rewrite admin.mockhero.dev/* → /admin/*
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "host", value: "admin.mockhero.dev" }],
          destination: "/admin/:path*",
        },
      ],
    };
  },

  // Security headers for all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

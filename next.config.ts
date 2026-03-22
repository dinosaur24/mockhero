import type { NextConfig } from "next";

// CSP directives — Clerk needs several external domains for auth iframes/scripts.
// next/font self-hosts Google Fonts so no external font-src is needed.
const cspDirectives = [
  "default-src 'self'",
  // unsafe-inline needed for Next.js inline scripts & Clerk; unsafe-eval for dev HMR
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://*.mockhero.dev https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.cookiebot.com https://*.cookiebot.eu https://datafa.st`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com https://www.googletagmanager.com https://www.google-analytics.com https://*.cookiebot.com",
  "font-src 'self'",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.mockhero.dev https://*.supabase.co https://challenges.cloudflare.com https://www.google-analytics.com https://*.cookiebot.com https://*.cookiebot.eu https://datafa.st",
  "frame-src 'self' https://*.clerk.accounts.dev https://*.mockhero.dev https://challenges.cloudflare.com https://*.cookiebot.com https://*.cookiebot.eu",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  // Increase serverless function timeout for large data generation requests
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
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
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

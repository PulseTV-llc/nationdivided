import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Origins the browser may talk to directly. The casting video upload goes
 * straight from the applicant's browser to private object storage using a
 * short-lived signed URL, so the storage origin must be allowed here.
 */
function storageOrigin(): string {
  const endpoint = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT;
  if (endpoint) {
    try {
      const url = new URL(endpoint);
      const bucket = process.env.S3_BUCKET;
      // Virtual-hosted style buckets (AWS) live on a subdomain of the endpoint.
      return bucket ? `${url.origin} https://${bucket}.${url.host}` : url.origin;
    } catch {
      return "";
    }
  }
  if (process.env.S3_BUCKET && process.env.S3_REGION) {
    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
  }
  return "";
}

const storage = storageOrigin();

const csp = [
  "default-src 'self'",
  // Next.js streams inline bootstrap scripts; nonces would force every page to
  // render dynamically, so inline scripts are allowed but no third-party hosts
  // beyond Cloudflare Turnstile (bot protection).
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "font-src 'self' data:",
  `media-src 'self' blob: ${storage}`,
  `connect-src 'self' ${storage} https://challenges.cloudflare.com ${isDev ? "ws:" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ")
  .replace(/\s+/g, " ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // PGlite (local development database) ships WebAssembly; keep it out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Never let caches or search engines keep private casting/admin pages.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;

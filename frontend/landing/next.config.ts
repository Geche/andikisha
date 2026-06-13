import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Pragmatic baseline CSP. 'unsafe-inline' is required because Next.js emits
// inline bootstrap scripts and we render inline JSON-LD; 'unsafe-eval' is only
// added in development for Turbopack/HMR. The browser only ever talks to its own
// origin (the calculator hits the same-origin /api route; the gateway and Resend
// are called server-side), so connect/img/font are scoped to 'self'.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [{ source: "/features", destination: "/product", permanent: true }];
  },
};

export default nextConfig;

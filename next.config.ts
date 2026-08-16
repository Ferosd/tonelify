import type { NextConfig } from "next";

// Static assets under /public are served with "max-age=0, must-revalidate" by
// default, so a returning visitor pays a round trip for each of the 241 hero
// frames. These files never change without a new filename, so they can be
// cached hard. _next/static already gets this treatment.
const IMMUTABLE = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

/**
 * Content-Security-Policy, in report-only mode to start with.
 *
 * The page pulls in Clerk, Stripe, Google Analytics, the TikTok pixel,
 * Fontshare and Google Fonts, so an enforced policy with one host missing
 * takes out sign-in or checkout. Report-Only changes nothing a visitor can
 * see: the browser evaluates the policy and reports what would have been
 * blocked, which is the list needed before this becomes the enforced header.
 *
 * 'unsafe-inline' and 'unsafe-eval' are in script-src because Next's own
 * bootstrap, the inline GA and TikTok snippets and Clerk all need them today.
 * They are what a hardening pass should remove next, via nonces.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.tiktok.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.fontshare.com",
  "img-src 'self' data: blob: https://img.clerk.com https://images.clerk.dev https://is1-ssl.mzstatic.com https://*.mzstatic.com https://www.google-analytics.com",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://analytics.tiktok.com https://itunes.apple.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // /request-gear and /feedback were the same form with different wording,
      // which meant two nav rows, two inboxes and a visitor guessing which one
      // their message belonged in. Gear requests are a kind on /feedback now.
      // 308 rather than a client redirect so the ranking the old URL earned
      // moves with it.
      { source: "/request-gear", destination: "/feedback?kind=gear", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
      { source: "/frames/:path*", headers: [IMMUTABLE] },
      { source: "/images/:path*", headers: [IMMUTABLE] },
      { source: "/albums/:path*", headers: [IMMUTABLE] },
      { source: "/videos/:path*", headers: [IMMUTABLE] },
      { source: "/video.mp4", headers: [IMMUTABLE] },
      { source: "/logo.png", headers: [IMMUTABLE] },
      { source: "/og-image.png", headers: [IMMUTABLE] },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// Static assets under /public are served with "max-age=0, must-revalidate" by
// default, so a returning visitor pays a round trip for each of the 241 hero
// frames. These files never change without a new filename, so they can be
// cached hard. _next/static already gets this treatment.
const IMMUTABLE = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
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

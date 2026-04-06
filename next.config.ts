// next.config.ts
import type { NextConfig } from "next";
import path from "path";

// Shared alias map — used by both Turbopack and webpack
// so the empty stub is applied consistently in all build modes.
const firebaseStorageAliases = {
  "firebase/storage":         path.resolve("./src/lib/empty-module.ts"),
  "@firebase/storage":        path.resolve("./src/lib/empty-module.ts"),
  "@firebase/storage-compat": path.resolve("./src/lib/empty-module.ts"),
};

const nextConfig: NextConfig = {
  // ── Server-only packages — never bundle into client chunks ──
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@opentelemetry/api",
  ],

  // ── Turbopack alias (next dev --turbo) ───────────────────────
  turbopack: {
    resolveAlias: firebaseStorageAliases,
  },

  // ── Webpack alias (next build + next dev without --turbo) ────
  // Mirrors the Turbopack config so both build pipelines stub out
  // firebase/storage identically — prevents bundling errors in CI
  // and production builds which always use webpack.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...firebaseStorageAliases,
    };
    return config;
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com"        },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats:         ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff"                         },
          { key: "X-Frame-Options",        value: "DENY"                            },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
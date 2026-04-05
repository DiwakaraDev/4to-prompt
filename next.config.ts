import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ── Server-only packages — never bundle into client chunks ──
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@opentelemetry/api",
  ],

  // ── Tell Turbopack to replace firebase/storage with empty stub ──
  experimental: {
    turbo: {
      resolveAlias: {
        "firebase/storage":         path.resolve("./src/lib/empty-module.ts"),
        "@firebase/storage":        path.resolve("./src/lib/empty-module.ts"),
        "@firebase/storage-compat": path.resolve("./src/lib/empty-module.ts"),
      },
    },
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
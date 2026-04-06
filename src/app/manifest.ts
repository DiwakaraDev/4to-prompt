// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "4to Prompt",
    short_name:       "4to",
    description:      "Premium AI Prompt Library",
    start_url:        "/",
    display:          "standalone",
    background_color: "#0d0f1a",
    theme_color:      "#bc67ff",
    icons: [
      {
        src:   "/icon.png",
        sizes: "192x192",
        type:  "image/png",
      },
      {
        src:   "/icon.png",
        sizes: "512x512",
        type:  "image/png",
      },
    ],
  };
}
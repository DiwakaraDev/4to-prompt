// src/components/prompts/PromptGridSection.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { RiImageLine } from "react-icons/ri";

// Temporary skeleton placeholder — replaced with real data in Step 6
export function PromptGridSection() {
  const searchParams = useSearchParams();
  const q        = searchParams.get("q")        || "";
  const category = searchParams.get("category") || "";
  const type     = searchParams.get("type")     || "all";

  return (
    <section className="section">
      <div className="container">

        {/* Section header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize:   "var(--text-xl)",
                fontWeight: 700,
              }}
            >
              {q
                ? `Results for "${q}"`
                : type === "premium"
                ? "✦ Premium Prompts"
                : type === "free"
                ? "Free Prompts"
                : "All Prompts"}
            </h2>
            {category && category !== "All" && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Category: {category}
              </p>
            )}
          </div>
        </div>

        {/* Skeleton grid — replaced in Step 6 */}
        <div className="prompt-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Prompt card skeleton ───────────────────────────────────────
export function PromptCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div style={{ padding: "var(--space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-badge w-16" />
        </div>
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text-sm" />
        <div className="flex items-center justify-between mt-4">
          <div className="skeleton skeleton-btn w-20 h-8" style={{ borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
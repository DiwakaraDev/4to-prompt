// src/app/(main)/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { usePrompts } from "@/hooks/usePrompts";
import { searchPrompts } from "@/services/prompts.service";
import { HeroSection } from "@/components/prompts/HeroSection";
import { PromptCardSkeleton } from "@/components/prompts/PromptCardSkeleton";
import { cn } from "@/lib/utils";
import type { Prompt, PromptCategory } from "@/types";
import {
  RiSearchLine, RiCloseLine,
  RiImageLine, RiVipCrownLine,
} from "react-icons/ri";

const PromptCard = dynamic(
  () => import("@/components/prompts/PromptCard").then(m => ({ default: m.PromptCard })),
  { loading: () => <PromptCardSkeleton />, ssr: false }
);

const CATEGORIES: Array<PromptCategory | "All"> = [
  "All", "Anime", "Fantasy", "Sci-Fi", "Portrait",
  "Landscape", "Architecture", "Abstract", "Other",
];

export default function HomePage() {

  const [activeTab,      setActiveTab]      = useState<"all" | "free" | "premium">("all");
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "All">("All");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState<Prompt[] | null>(null);
  const [searching,      setSearching]      = useState(false);

  // Infinite scroll sentinel
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  const filterPremium =
    activeTab === "free"    ? false :
    activeTab === "premium" ? true  : undefined;

  // ── `initiated` removed — no longer needed here ─────────────
  const { prompts, loading, hasMore, loadInitial, loadMore, reset } = usePrompts({
    filterPremium,
    category: activeCategory,
  });

  // ── Single effect: handles mount + filter changes ────────────
  // reset() clears stale data synchronously, then loadInitial()
  // fetches with the correct new options already baked into the
  // useCallback reference — no double-fetch possible.
  useEffect(() => {
    reset();
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]);

  // ── Infinite scroll trigger ──────────────────────────────────
  useEffect(() => {
    if (inView && hasMore && !loading && !searchResults) {
      loadMore();
    }
  }, [inView, hasMore, loading, searchResults, loadMore]);

  // ── Debounced search ─────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchPrompts(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayPrompts = searchResults ?? prompts;
  const isLoading      = loading || searching;

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSearchResults(null);
  }, []);

  return (
    <>
      <HeroSection />

      <section id="prompts" className="section-tight">
        <div className="container">

          {/* ── Search + Filters ─────────────────────────── */}
          <div className="flex flex-col gap-4 mb-8">

            {/* Search bar */}
            <div className="relative max-w-xl">
              {searching
                ? <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2
                                   border-white/10 border-t-[var(--color-primary)] rounded-full animate-spin" />
                : <RiSearchLine size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--color-text-faint)" }} />
              }
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search prompts, categories…"
                className="input pl-10 pr-10"
                aria-label="Search prompts"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-faint)" }}
                  aria-label="Clear search"
                >
                  <RiCloseLine size={16} />
                </button>
              )}
            </div>

            {/* Tab + Category row */}
            <div className="flex flex-wrap items-center gap-3">

              {/* FREE / PREMIUM tabs */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: "var(--color-surface-2)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {(["all", "free", "premium"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold",
                      "transition-all duration-200 capitalize",
                      activeTab === tab
                        ? "text-white shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-white"
                    )}
                    style={activeTab === tab ? {
                      background: tab === "premium"
                        ? "linear-gradient(135deg, rgba(245,200,66,0.18), rgba(245,200,66,0.08))"
                        : "var(--color-surface-4)",
                      color: tab === "premium" ? "var(--color-gold)" : undefined,
                    } : undefined}
                  >
                    {tab === "premium" && <RiVipCrownLine size={12} />}
                    {tab === "all"     && <RiImageLine size={12} />}
                    {tab === "free"    && "✓ "}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Category chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-150",
                      activeCategory === cat
                        ? "text-white"
                        : "hover:text-white"
                    )}
                    style={activeCategory === cat ? {
                      background: "var(--color-primary-muted)",
                      border:     "1px solid rgba(188,103,255,0.35)",
                      color:      "var(--color-primary)",
                    } : {
                      background: "var(--color-surface-2)",
                      border:     "1px solid rgba(255,255,255,0.07)",
                      color:      "var(--color-text-muted)",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            {searchResults && (
              <p className="text-xs animate-fadeIn" style={{ color: "var(--color-text-muted)" }}>
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {/* ── Grid ─────────────────────────────────────── */}
          <div className="prompt-grid">
            {displayPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
              />
            ))}

            {/* Skeleton loaders */}
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <PromptCardSkeleton key={`sk-${i}`} />
              ))
            }
          </div>

          {/* Empty state */}
          {!isLoading && displayPrompts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <RiImageLine size={26} style={{ color: "var(--color-text-faint)" }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                {searchQuery ? "No prompts found" : "No prompts yet"}
              </h3>
              <p className="text-sm max-w-xs" style={{ color: "var(--color-text-muted)" }}>
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "Be the first to add a prompt!"}
              </p>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {!searchResults && hasMore && (
            <div ref={sentinelRef} className="h-10 mt-4" aria-hidden="true" />
          )}

          {/* End of list */}
          {!hasMore && displayPrompts.length > 0 && !searchResults && (
            <p
              className="text-center text-xs mt-8 animate-fadeIn"
              style={{ color: "var(--color-text-faint)" }}
            >
              You&apos;ve seen all prompts ✦
            </p>
          )}

        </div>
      </section>
    </>
  );
}
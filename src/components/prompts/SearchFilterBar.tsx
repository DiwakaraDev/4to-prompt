// src/components/prompts/SearchFilterBar.tsx
"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RiSearchLine, RiFilterLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import type { PromptCategory } from "@/types";

const CATEGORIES: Array<PromptCategory | "All"> = [
  "All", "Anime", "Fantasy", "Sci-Fi", "Portrait",
  "Landscape", "Architecture", "Abstract", "Other",
];

const TYPE_FILTERS = [
  { value: "all",     label: "All"     },
  { value: "free",    label: "Free"    },
  { value: "premium", label: "✦ Premium" },
];

export function SearchFilterBar() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search,   setSearch]   = useState(searchParams.get("q")        || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [type,     setType]     = useState(searchParams.get("type")     || "all");

  const updateURL = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all" && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset pagination on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateURL("q", search.trim());
  }

  function handleCategory(cat: string) {
    setCategory(cat);
    updateURL("category", cat);
  }

  function handleType(t: string) {
    setType(t);
    updateURL("type", t);
  }

  return (
    <section
      id="prompts"
      className="sticky top-[72px] z-[100] py-4"
      style={{
        background:  "rgba(26, 29, 38, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <div className="container">
        <div className="flex flex-col gap-4">

          {/* Search + Type filter row */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search input */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 relative"
              role="search"
            >
              <label htmlFor="prompt-search" className="sr-only">
                Search prompts
              </label>
              <RiSearchLine
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-text-faint)" }}
                aria-hidden="true"
              />
              <input
                id="prompt-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, styles, categories…"
                className="input pl-11 pr-4"
                style={{ background: "var(--color-surface-2)" }}
              />
            </form>

            {/* Type filter buttons */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "var(--color-surface-2)" }}
              role="group"
              aria-label="Filter by type"
            >
              {TYPE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleType(value)}
                  aria-pressed={type === value}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "min-h-[36px] whitespace-nowrap",
                    type === value
                      ? value === "premium"
                        ? "gradient-gold text-[#1a1400] font-bold shadow-sm"
                        : "bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            role="group"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                aria-pressed={category === cat}
                className={cn(
                  "badge shrink-0 cursor-pointer transition-all duration-200 min-h-[32px]",
                  "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                  category === cat
                    ? "badge-primary"
                    : "bg-transparent border-white/10 text-[var(--color-text-muted)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading indicator */}
          {isPending && (
            <div
              className="absolute bottom-0 left-0 h-[2px] rounded-full animate-pulse"
              style={{
                background: "var(--color-primary)",
                width: "60%",
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
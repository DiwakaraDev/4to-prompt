// src/app/admin/prompts/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchAllPromptsAdmin, deletePrompt, updatePrompt,
} from "@/services/prompts.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Prompt } from "@/types";
import {
  RiImageAddLine, RiDeleteBinLine, RiVipCrownLine,
  RiCheckLine, RiSearchLine,
} from "react-icons/ri";

export default function AdminPromptsPage() {
  const [prompts,  setPrompts]  = useState<Prompt[]>([]);
  const [filtered, setFiltered] = useState<Prompt[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPromptsAdmin()
      .then(data => { setPrompts(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      term
        ? prompts.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term))
        : prompts
    );
  }, [search, prompts]);

  async function handleDelete(prompt: Prompt) {
    if (!confirm(`Delete "${prompt.title}"? This cannot be undone.`)) return;
    setDeleting(prompt.id);
    try {
      await deletePrompt(prompt.id);
      setPrompts(prev => prev.filter(p => p.id !== prompt.id));
      toast.success("Prompt deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleTogglePremium(prompt: Prompt) {
    setToggling(prompt.id);
    try {
      await updatePrompt(prompt.id, { isPremium: !prompt.isPremium });
      setPrompts(prev =>
        prev.map(p => p.id === prompt.id ? { ...p, isPremium: !p.isPremium } : p)
      );
      toast.success(prompt.isPremium ? "Moved to Free." : "Moved to Premium.");
    } catch {
      toast.error("Failed to update.");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)", fontWeight: 800,
          }}>
            Prompts
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {prompts.length} total prompts
          </p>
        </div>
        <Link href="/admin/upload" className="btn btn-primary btn-sm">
          <RiImageAddLine size={15} />
          Add Prompt
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <RiSearchLine size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-faint)" }} />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or category…"
          className="input pl-9"
          aria-label="Search prompts"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col divide-y"
            style={{ "--tw-divide-opacity": 1, borderColor: "rgba(255,255,255,0.05)" } as React.CSSProperties}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="skeleton rounded-lg shrink-0"
                  style={{ width: "48px", height: "48px" }} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="skeleton skeleton-text" style={{ width: "40%", height: "12px" }} />
                  <div className="skeleton skeleton-text-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {search ? `No results for "${search}"` : "No prompts yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Image", "Title", "Category", "Type", "Likes", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--color-text-faint)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((prompt, i) => (
                  <tr
                    key={prompt.id}
                    className="group/row transition-colors duration-100"
                    style={{
                      borderBottom: i < filtered.length - 1
                        ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Image src={prompt.imageUrl} alt={prompt.title}
                          fill className="object-cover" />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="font-medium max-w-[200px] truncate"
                        style={{ color: "var(--color-text)" }}>
                        {prompt.title}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="badge badge-primary">{prompt.category}</span>
                    </td>

                    {/* Type toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePremium(prompt)}
                        disabled={toggling === prompt.id}
                        className={cn(
                          "badge transition-all duration-150",
                          prompt.isPremium ? "badge-premium" : "badge-free"
                        )}
                        style={{ cursor: "pointer" }}
                        title="Click to toggle"
                      >
                        {toggling === prompt.id ? (
                          <span className="w-3 h-3 border border-current/30 border-t-current
                                           rounded-full animate-spin" />
                        ) : prompt.isPremium ? (
                          <><RiVipCrownLine size={10} />Premium</>
                        ) : (
                          <><RiCheckLine size={10} />Free</>
                        )}
                      </button>
                    </td>

                    {/* Likes */}
                    <td className="px-4 py-3 text-xs"
                      style={{ color: "var(--color-text-muted)" }}>
                      {prompt.likesCount ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(prompt)}
                        disabled={deleting === prompt.id}
                        aria-label={`Delete ${prompt.title}`}
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: "30px", padding: "4px 10px", fontSize: "12px" }}
                      >
                        {deleting === prompt.id
                          ? <span className="w-3 h-3 border border-current/30 border-t-current
                                             rounded-full animate-spin" />
                          : <RiDeleteBinLine size={13} />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
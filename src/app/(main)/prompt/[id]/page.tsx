// src/app/(main)/prompt/[id]/page.tsx
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchPromptById, likePrompt, unlikePrompt, hasUserLikedPrompt } from "@/services/prompts.service";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Prompt } from "@/types";
import {
  RiFileCopyLine,
  RiCheckLine,
  RiHeartLine,
  RiHeartFill,
  RiVipCrownLine,
  RiArrowLeftLine,
  RiUserLine,
  RiCalendarLine,
  RiPriceTag3Line,
  RiImageLine,
  RiLockLine,
  RiShieldUserLine,
} from "react-icons/ri";

// ── Dynamically import the heavy comments section ───────────────
const CommentSection = dynamic(
  () =>
    import("@/components/comments/CommentSection").then(
      (m) => ({ default: m.CommentSection })
    ),
  {
    loading: () => (
      <div className="glass rounded-2xl p-6">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-text-faint)" }}
        >
          Comments
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div
                className="skeleton rounded-lg shrink-0"
                style={{ width: "28px", height: "28px" }}
              />
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="skeleton rounded"
                  style={{ height: "10px", width: "28%" }}
                />
                <div
                  className="skeleton rounded"
                  style={{ height: "12px", width: "80%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

// ─────────────────────────────────────────────────────────────────
// Skeleton — shown while prompt is loading
// ─────────────────────────────────────────────────────────────────

function PromptDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back button skeleton */}
      <div className="skeleton rounded-xl" style={{ height: "32px", width: "100px" }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Image skeleton */}
        <div
          className="skeleton rounded-2xl"
          style={{ aspectRatio: "4/3", width: "100%" }}
        />

        {/* Right panel skeleton */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="skeleton rounded" style={{ height: "14px", width: "40%" }} />
            <div className="skeleton rounded" style={{ height: "28px", width: "75%" }} />
            <div className="flex gap-2">
              <div className="skeleton rounded-full" style={{ height: "22px", width: "70px" }} />
              <div className="skeleton rounded-full" style={{ height: "22px", width: "60px" }} />
            </div>
            <div
              className="skeleton rounded-xl"
              style={{ height: "1px", width: "100%", marginBlock: "4px" }}
            />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton rounded" style={{ height: "11px", width: i === 3 ? "50%" : "90%" }} />
            ))}
          </div>
          <div className="skeleton rounded-2xl" style={{ height: "52px" }} />
        </div>
      </div>

      {/* Comments skeleton */}
      <div className="glass rounded-2xl p-6">
        <div className="skeleton rounded" style={{ height: "11px", width: "120px", marginBottom: "16px" }} />
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 mb-4">
            <div className="skeleton rounded-lg shrink-0" style={{ width: "28px", height: "28px" }} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="skeleton rounded" style={{ height: "10px", width: "25%" }} />
              <div className="skeleton rounded" style={{ height: "12px", width: "70%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Premium Lock Overlay
// ─────────────────────────────────────────────────────────────────

function PremiumLock() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl z-10"
      style={{
        background:
          "linear-gradient(to top, rgba(10,12,22,0.97) 0%, rgba(10,12,22,0.80) 50%, transparent 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Crown icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center animate-fadeInUp"
        style={{
          background: "rgba(245,200,66,0.12)",
          border: "1px solid rgba(245,200,66,0.30)",
          boxShadow: "0 0 24px rgba(245,200,66,0.18)",
        }}
      >
        <RiVipCrownLine size={26} style={{ color: "var(--color-gold)" }} />
      </div>

      <div className="text-center animate-fadeInUp stagger-1">
        <p
          className="font-bold text-base mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-gold)",
          }}
        >
          Premium Prompt
        </p>
        <p className="text-xs max-w-[200px]" style={{ color: "var(--color-text-muted)" }}>
          Unlock this prompt to see the full text
        </p>
      </div>

      <div className="flex flex-col gap-2 animate-fadeInUp stagger-2 w-[180px]">
        <Link
          href="/login"
          className="btn w-full justify-center text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, #f5c842, #e0a800)",
            color: "#1a1200",
            minHeight: "40px",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <RiVipCrownLine size={14} />
          Unlock Premium
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Copy Prompt Button
// ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy prompt text"}
      className={cn(
        "btn w-full justify-center gap-2 transition-all duration-200 font-semibold",
        copied ? "btn-success" : "btn-primary"
      )}
      style={{ minHeight: "44px" }}
    >
      {copied ? (
        <>
          <RiCheckLine size={16} />
          Copied!
        </>
      ) : (
        <>
          <RiFileCopyLine size={16} />
          Copy Prompt
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Like Button
// ─────────────────────────────────────────────────────────────────

function LikeButton({
  promptId,
  initialCount,
}: {
  promptId:     string;
  initialCount: number;
}) {
  const { user }         = useAuth();
  const [liked,   setLiked]   = useState(false);
  const [count,   setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check initial like state
  useEffect(() => {
    if (!user) { setChecked(true); return; }
    hasUserLikedPrompt(promptId, user.uid)
      .then(setLiked)
      .finally(() => setChecked(true));
  }, [promptId, user]);

  async function handleToggle() {
    if (!user) {
      toast.error("Sign in to like prompts.");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        await unlikePrompt(promptId, user.uid);
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await likePrompt(promptId, user.uid);
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch {
      toast.error("Failed to update like.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !checked}
      aria-label={liked ? "Unlike this prompt" : "Like this prompt"}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
        "transition-all duration-200 border",
        liked
          ? "border-[rgba(255,80,80,0.35)]"
          : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,80,80,0.25)]"
      )}
      style={{
        background: liked ? "rgba(255,80,80,0.10)" : "var(--color-surface-2)",
        color: liked ? "#ff6b6b" : "var(--color-text-muted)",
        minHeight: "40px",
      }}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current/20 border-t-current
                     rounded-full animate-spin"
        />
      ) : liked ? (
        <RiHeartFill size={16} style={{ color: "#ff6b6b" }} />
      ) : (
        <RiHeartLine size={16} />
      )}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────

export default function PromptDetailPage() {
  const params          = useParams();
  const router          = useRouter();
  const { user }        = useAuth();
  const id              = params?.id as string;

  const [prompt,  setPrompt]  = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Fetch prompt ──────────────────────────────────────────────
  const loadPrompt = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchPromptById(id);
      if (!data) { setNotFound(true); return; }
      setPrompt(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  // ── Derived state ─────────────────────────────────────────────
  const isAdmin     = user?.role === "admin";
  const isPremium   = prompt?.isPremium ?? false;
  const canViewFull = !isPremium || isAdmin; // Extend this when payment is added

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return <PromptDetailSkeleton />;

  // ── Not found ─────────────────────────────────────────────────
  if (notFound || !prompt) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <RiImageLine size={24} style={{ color: "var(--color-text-faint)" }} />
        </div>
        <div className="text-center">
          <p
            className="font-bold text-base mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Prompt Not Found
          </p>
          <p className="text-sm">
            This prompt may have been removed or doesn&apos;t exist.
          </p>
        </div>
        <button onClick={() => router.push("/")} className="btn btn-primary">
          <RiArrowLeftLine size={15} />
          Browse Prompts
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--color-bg)", paddingBottom: "var(--space-16)" }}
    >
      {/* Ambient background gradient */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 30% 20%,
              rgba(188,103,255,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 70%,
              rgba(0,242,255,0.05) 0%, transparent 55%)
          `,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-7 flex flex-col gap-6">

        {/* ── Back navigation ────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium w-fit
                     transition-all duration-150 group"
          style={{ color: "var(--color-text-muted)" }}
        >
          <RiArrowLeftLine
            size={16}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          Back
        </button>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

          {/* ── LEFT: Image ────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div
              className="relative rounded-2xl overflow-hidden group/image"
              style={{
                aspectRatio: "4/3",
                background: "var(--color-surface-2)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
              }}
            >
              {/* Actual image */}
              <Image
                src={prompt.imageUrl}
                alt={prompt.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* Premium blur + lock overlay */}
              {isPremium && !canViewFull && (
                <>
                  {/* Blur the image */}
                  <div
                    className="absolute inset-0 z-[5]"
                    style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
                  />
                  <PremiumLock />
                </>
              )}

              {/* Premium badge (top-left) — visible to everyone */}
              {isPremium && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="badge badge-premium animate-fadeIn"
                    style={{
                      padding: "5px 10px",
                      fontSize: "11px",
                      boxShadow: "0 4px 12px rgba(245,200,66,0.25)",
                    }}
                  >
                    <RiVipCrownLine size={11} />
                    Premium
                  </span>
                </div>
              )}

              {/* Admin badge (top-right) */}
              {isAdmin && isPremium && (
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className="badge animate-fadeIn text-[10px]"
                    style={{
                      background: "rgba(188,103,255,0.15)",
                      border: "1px solid rgba(188,103,255,0.30)",
                      color: "var(--color-primary)",
                      padding: "4px 8px",
                    }}
                  >
                    <RiShieldUserLine size={10} />
                    Admin Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Details panel ───────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Info card */}
            <div
              className="glass rounded-2xl p-5 flex flex-col gap-4 animate-fadeInUp"
            >
              {/* Category + type row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-primary">
                  <RiPriceTag3Line size={10} />
                  {prompt.category}
                </span>
                {isPremium ? (
                  <span className="badge badge-premium">
                    <RiVipCrownLine size={10} />
                    Premium
                  </span>
                ) : (
                  <span className="badge badge-free">
                    <RiCheckLine size={10} />
                    Free
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                {prompt.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-col gap-1.5">
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  <RiUserLine size={12} />
                  <span>
                    By{" "}
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {prompt.createdByName}
                    </span>
                  </span>
                </div>
                {prompt.createdAt && (
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    <RiCalendarLine size={12} />
                    <span>{formatDate(prompt.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                }}
              />

              {/* Prompt text box */}
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Prompt
                </div>

                {canViewFull ? (
                  /* ── Full prompt text (free or admin) ─────── */
                  <div
                    className="relative rounded-xl p-4 font-mono text-sm leading-relaxed
                               select-all cursor-text"
                    style={{
                      background: "rgba(0,0,0,0.28)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "var(--color-text-muted)",
                      fontSize: "var(--text-xs)",
                      lineHeight: 1.7,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      maxHeight: "240px",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(188,103,255,0.25) transparent",
                    }}
                    aria-label="Prompt text — click to select all"
                  >
                    {prompt.promptText}
                  </div>
                ) : (
                  /* ── Locked prompt text (premium, not logged-in) ── */
                  <div className="relative rounded-xl overflow-hidden">
                    {/* Blurred preview */}
                    <div
                      className="p-4 font-mono text-sm leading-relaxed select-none"
                      style={{
                        background: "rgba(0,0,0,0.28)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "var(--color-text-muted)",
                        fontSize: "var(--text-xs)",
                        lineHeight: 1.7,
                        filter: "blur(6px)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      aria-hidden="true"
                    >
                      {/* Show garbled text as placeholder */}
                      {prompt.promptText.slice(0, 80).replace(/\S/g, "•")}{" "}
                      {prompt.promptText.slice(80, 180).replace(/\S/g, "◦")}…
                    </div>

                    {/* Lock overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl"
                      style={{
                        background: "rgba(10,12,22,0.70)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <RiLockLine
                        size={18}
                        style={{ color: "var(--color-gold)" }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--color-gold)" }}
                      >
                        Premium Only
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Action buttons ─────────────────────────── */}
            <div className="flex flex-col gap-2.5 animate-fadeInUp stagger-1">
              {canViewFull ? (
                <CopyButton text={prompt.promptText} />
              ) : (
                <Link
                  href="/login"
                  className="btn w-full justify-center font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #f5c842, #e0a800)",
                    color: "#1a1200",
                    minHeight: "44px",
                    borderRadius: "var(--radius-xl)",
                  }}
                >
                  <RiVipCrownLine size={16} />
                  Unlock Premium to Copy
                </Link>
              )}

              <LikeButton
                promptId={prompt.id}
                initialCount={prompt.likesCount ?? 0}
              />
            </div>

            {/* ── Admin quick actions ─────────────────────── */}
            {isAdmin && (
              <div
                className="glass rounded-2xl p-4 flex flex-col gap-2.5 animate-fadeInUp stagger-2"
              >
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Admin Actions
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/prompts`}
                    className="btn btn-ghost btn-sm flex-1 justify-center"
                  >
                    Manage Prompts
                  </Link>
                  <Link
                    href={`/admin/upload`}
                    className="btn btn-secondary btn-sm flex-1 justify-center"
                  >
                    Add New
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Comments section (dynamically loaded) ──────────── */}
        <div className="animate-fadeInUp stagger-3">
          <CommentSection promptId={prompt.id} />
        </div>

      </div>
    </div>
  );
}
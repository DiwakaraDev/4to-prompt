// src/components/prompts/PromptCard.tsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { PremiumLockModal } from "@/components/prompts/PremiumLockModal";
import {
  likePrompt,
  unlikePrompt,
  hasUserLikedPrompt,
} from "@/services/prompts.service";
import {
  RiFileCopyLine,
  RiCheckLine,
  RiVipCrownLine,
  RiHeartLine,
  RiHeartFill,
  RiMessage3Line,
  RiShareForwardLine,
  RiLoginBoxLine,
} from "react-icons/ri";
import { FiLink } from "react-icons/fi";
import { FaWhatsapp, FaTwitter, FaFacebookF } from "react-icons/fa";
import toast from "react-hot-toast";

interface PromptCardProps {
  prompt: Prompt;
  commentsCount?: number;
}

export function PromptCard({
  prompt,
  commentsCount = 0,
}: PromptCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { canViewPremium } = usePremium();

  const [copied, setCopied]                   = useState(false);
  const [shareOpen, setShareOpen]             = useState(false);
  const [linkCopied, setLinkCopied]           = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const [liked, setLiked]             = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeChecked, setLikeChecked] = useState(false);
  const [likesCount, setLikesCount]   = useState(prompt.likesCount ?? 0);

  const shareRef = useRef<HTMLDivElement | null>(null);

  const isLocked = prompt.isPremium && !canViewPremium;

  const promptUrl = useMemo(() => {
    if (typeof window === "undefined") return `/prompt/${prompt.id}`;
    return `${window.location.origin}/prompt/${prompt.id}`;
  }, [prompt.id]);

  const shareText = useMemo(
    () => `Check this AI prompt: ${prompt.title}`,
    [prompt.title],
  );

  // ── Auth gate helper ────────────────────────────────────────
  // Returns true if the user is signed in.
  // If not, shows a toast and redirects to login, then returns false.
  const requireAuth = useCallback(
    (action: string): boolean => {
      if (user) return true;
      toast.error(`Sign in to ${action}`, {
        icon: "🔐",
        duration: 2500,
      });
      router.push("/login");
      return false;
    },
    [user, router],
  );

  // ── Check if user already liked ────────────────────────────
  useEffect(() => {
    if (!user) {
      setLiked(false);
      setLikeChecked(true);
      return;
    }

    hasUserLikedPrompt(prompt.id, user.uid)
      .then(setLiked)
      .catch(() => setLiked(false))
      .finally(() => setLikeChecked(true));
  }, [prompt.id, user]);

  // ── Close share dropdown on outside click ──────────────────
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        shareRef.current &&
        !shareRef.current.contains(event.target as Node)
      ) {
        setShareOpen(false);
      }
    }

    if (shareOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [shareOpen]);

  // ── Copy prompt ─────────────────────────────────────────────
  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("copy prompts")) return;

      if (isLocked) {
        setShowUnlockModal(true);
        return;
      }

      try {
        await navigator.clipboard.writeText(prompt.promptText);
        setCopied(true);
        toast.success("Prompt copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Clipboard copy failed");
      }
    },
    [prompt.promptText, isLocked, requireAuth],
  );

  // ── Like / Unlike ───────────────────────────────────────────
  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("like prompts")) return;
      if (likeLoading) return;

      setLikeLoading(true);
      try {
        if (liked) {
          await unlikePrompt(prompt.id, user!.uid);
          setLiked(false);
          setLikesCount((prev) => Math.max(0, prev - 1));
        } else {
          await likePrompt(prompt.id, user!.uid);
          setLiked(true);
          setLikesCount((prev) => prev + 1);
        }
      } catch {
        toast.error("Failed to update like");
      } finally {
        setLikeLoading(false);
      }
    },
    [requireAuth, likeLoading, liked, prompt.id, user],
  );

  // ── Comment ─────────────────────────────────────────────────
  const handleComment = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("comment on prompts")) return;

      router.push(`/prompt/${prompt.id}#comments`);
    },
    [requireAuth, router, prompt.id],
  );

  // ── Share (open dropdown or native share) ──────────────────
  const handleNativeShare = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("share prompts")) return;

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: prompt.title,
            text:  shareText,
            url:   promptUrl,
          });
          return;
        } catch {
          // fall through to dropdown
        }
      }

      setShareOpen((prev) => !prev);
    },
    [requireAuth, prompt.title, shareText, promptUrl],
  );

  const handleCopyLink = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("copy link")) return;

      try {
        await navigator.clipboard.writeText(promptUrl);
        setLinkCopied(true);
        toast.success("Link copied");
        setTimeout(() => setLinkCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    },
    [requireAuth, promptUrl],
  );

  const handleWhatsAppShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("share on WhatsApp")) return;

      const text = encodeURIComponent(`${shareText}\n${promptUrl}`);
      window.open(
        `https://wa.me/?text=${text}`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [requireAuth, shareText, promptUrl],
  );

  const handleTwitterShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("share on Twitter")) return;

      const text = encodeURIComponent(shareText);
      const url  = encodeURIComponent(promptUrl);
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [requireAuth, shareText, promptUrl],
  );

  const handleFacebookShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("share on Facebook")) return;

      const url = encodeURIComponent(promptUrl);
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [requireAuth, promptUrl],
  );

  // ── Unlock premium button ───────────────────────────────────
  const handleUnlockClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!requireAuth("unlock premium")) return;

      setShowUnlockModal(true);
    },
    [requireAuth],
  );

  return (
    <>
      {showUnlockModal && (
        <PremiumLockModal onClose={() => setShowUnlockModal(false)} />
      )}

      <article
        className={cn(
          "group relative overflow-hidden rounded-[24px]",
          "border border-white/[0.08]",
          "backdrop-blur-xl transition-all duration-300",
          "hover:-translate-y-1 hover:border-white/[0.14]",
          "hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
        )}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)",
        }}
        aria-label={prompt.title}
      >
        {/* ── Image ─────────────────────────────────────────── */}
        <Link
          href={`/prompt/${prompt.id}`}
          aria-label={`View ${prompt.title}`}
        >
          <div className="relative aspect-[4/4.3] overflow-hidden">
            <OptimizedImage
              src={prompt.imageUrl}
              alt={prompt.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              containerClassName="w-full h-full"
              fallbackClassName="w-full h-full"
            />

            {/* top fade */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent z-[1]" />

            {/* bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0b0d16]/80 via-[#0b0d16]/20 to-transparent z-[1]" />

            {/* premium locked overlay */}
            {isLocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/30">
                <button
                  onClick={handleUnlockClick}
                  className="flex flex-col items-center gap-2 rounded-2xl px-5 py-4 transition-transform hover:scale-[1.02]"
                  style={{
                    border: "1px solid rgba(245,200,66,0.28)",
                    background: "rgba(20,16,4,0.55)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(245,200,66,0.15)",
                      border: "1px solid rgba(245,200,66,0.3)",
                    }}
                  >
                    <RiVipCrownLine size={18} style={{ color: "#f5c842" }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#f5c842" }}>
                    Unlock Premium
                  </span>
                </button>
              </div>
            )}

            {/* guest overlay — shown on hover when not signed in */}
            {!user && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                style={{ background: "rgba(7,10,18,0.55)" }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push("/login");
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
                    "border border-white/10 bg-[rgba(10,12,22,0.80)] text-white backdrop-blur-md",
                    "shadow-lg transition-all duration-200 hover:scale-[1.02]",
                  )}
                >
                  <RiLoginBoxLine size={14} />
                  Sign in to interact
                </button>
              </div>
            )}

            {/* hover quick copy — signed in + unlocked only */}
            {user && !isLocked && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                style={{ background: "rgba(7,10,18,0.24)" }}
              >
                <button
                  onClick={handleCopy}
                  aria-label="Copy prompt"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
                    "border border-white/10 bg-[rgba(10,12,22,0.72)] text-white backdrop-blur-md",
                    "shadow-lg transition-all duration-200 hover:scale-[1.02]",
                    copied && "border-emerald-400/30 text-emerald-300",
                  )}
                >
                  {copied ? (
                    <><RiCheckLine size={14} />Copied</>
                  ) : (
                    <><RiFileCopyLine size={14} />Copy Prompt</>
                  )}
                </button>
              </div>
            )}

            {/* badges */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  prompt.isPremium ? "text-[#1a1200]" : "text-emerald-300",
                )}
                style={
                  prompt.isPremium
                    ? { background: "linear-gradient(135deg,#f5c842,#e0a800)" }
                    : {
                        background: "rgba(110,231,183,0.15)",
                        border: "1px solid rgba(110,231,183,0.25)",
                      }
                }
              >
                {prompt.isPremium ? "✦ Premium" : "Free"}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Content ───────────────────────────────────────── */}
        <div className="relative z-20 p-4">

          {/* title + category */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <Link
              href={`/prompt/${prompt.id}`}
              className="min-w-0 text-[15px] font-semibold leading-[1.35] transition-colors hover:text-[var(--color-primary)]"
              style={{ color: "var(--color-text)" }}
            >
              <span className="block truncate">{prompt.title}</span>
            </Link>

            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: "rgba(188,103,255,0.10)",
                border: "1px solid rgba(188,103,255,0.20)",
                color: "var(--color-primary)",
              }}
            >
              {prompt.category}
            </span>
          </div>

          {/* prompt preview */}
          <p
            className="mb-3 line-clamp-2 text-xs leading-5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isLocked
              ? "Unlock premium to view and copy this prompt..."
              : prompt.promptText}
          </p>

          {/* stats row */}
          <div
            className="mb-3 flex items-center gap-3 text-xs"
            style={{ color: "var(--color-text-faint)" }}
          >
            <div className="inline-flex items-center gap-1.5">
              <RiHeartLine size={13} />
              <span>{likesCount}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <RiMessage3Line size={13} />
              <span>{commentsCount}</span>
            </div>
          </div>

          {/* ── Action bar ───────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={!likeChecked || likeLoading}
              aria-label={liked ? "Unlike prompt" : "Like prompt"}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
                "border transition-all duration-200",
                liked
                  ? "border-red-400/20 bg-red-500/10 text-red-300"
                  : "border-white/[0.08] bg-white/[0.03] text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-white",
                likeLoading && "opacity-60 cursor-not-allowed",
              )}
            >
              {liked ? (
                <RiHeartFill size={14} className="shrink-0" />
              ) : (
                <RiHeartLine size={14} className="shrink-0" />
              )}
              Like
            </button>

            {/* Comment */}
            <button
              onClick={handleComment}
              aria-label="Open comments"
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
                "border border-white/[0.08] bg-white/[0.03] text-[var(--color-text-muted)]",
                "transition-all duration-200 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <RiMessage3Line size={14} className="shrink-0" />
              Comment
            </button>

            {/* Share */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={handleNativeShare}
                aria-label="Share prompt"
                className={cn(
                  "w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
                  "border border-white/[0.08] bg-white/[0.03] text-[var(--color-text-muted)]",
                  "transition-all duration-200 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <RiShareForwardLine size={14} className="shrink-0" />
                Share
              </button>

              {shareOpen && (
                <div
                  className="absolute right-0 bottom-[calc(100%+10px)] z-40 min-w-[190px] rounded-2xl p-2"
                  style={{
                    background: "rgba(15,18,28,0.97)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {linkCopied ? (
                        <RiCheckLine size={13} />
                      ) : (
                        <FiLink size={13} />
                      )}
                      {linkCopied ? "Link copied!" : "Copy link"}
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <FaWhatsapp size={13} style={{ color: "#25D366" }} />
                      WhatsApp
                    </button>

                    <button
                      onClick={handleTwitterShare}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <FaTwitter size={13} style={{ color: "#1DA1F2" }} />
                      Twitter / X
                    </button>

                    <button
                      onClick={handleFacebookShare}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-white/5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <FaFacebookF size={13} style={{ color: "#1877F2" }} />
                      Facebook
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="mt-3 flex items-center justify-between">
            {isLocked ? (
              <button
                onClick={handleUnlockClick}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f5c842, #e0a800)",
                  color: "#1a1200",
                }}
              >
                <RiVipCrownLine size={13} />
                Unlock Premium
              </button>
            ) : !user ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/login");
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium",
                  "border border-[rgba(188,103,255,0.20)] bg-[rgba(188,103,255,0.08)]",
                  "text-[var(--color-primary)] transition-all duration-200 hover:bg-[rgba(188,103,255,0.14)]",
                )}
              >
                <RiLoginBoxLine size={13} />
                Sign in to Copy
              </button>
            ) : (
              <button
                onClick={handleCopy}
                aria-label="Copy prompt text"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium",
                  "border border-[rgba(188,103,255,0.20)] bg-[rgba(188,103,255,0.08)]",
                  "text-[var(--color-primary)] transition-all duration-200 hover:bg-[rgba(188,103,255,0.14)]",
                )}
              >
                {copied ? (
                  <RiCheckLine size={13} />
                ) : (
                  <RiFileCopyLine size={13} />
                )}
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
            )}

            <Link
              href={`/prompt/${prompt.id}`}
              className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: "var(--color-text-faint)" }}
            >
              View details →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
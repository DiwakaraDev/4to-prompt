// src/components/prompts/PromptCard.tsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAuth } from "@/hooks/useAuth";
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
} from "react-icons/ri";
import { FiLink } from "react-icons/fi";
import { FaWhatsapp, FaTwitter, FaFacebookF } from "react-icons/fa";
import toast from "react-hot-toast";

interface PromptCardProps {
  prompt: Prompt;
  isPremiumUser?: boolean;
  commentsCount?: number;
}

export function PromptCard({
  prompt,
  isPremiumUser = false,
  commentsCount = 0,
}: PromptCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeChecked, setLikeChecked] = useState(false);
  const [likesCount, setLikesCount] = useState(prompt.likesCount ?? 0);

  const shareRef = useRef<HTMLDivElement | null>(null);

  const isLocked = prompt.isPremium && !isPremiumUser;

  const promptUrl = useMemo(() => {
    if (typeof window === "undefined") return `/prompt/${prompt.id}`;
    return `${window.location.origin}/prompt/${prompt.id}`;
  }, [prompt.id]);

  const shareText = useMemo(() => {
    return `Check this AI prompt: ${prompt.title}`;
  }, [prompt.title]);

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

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
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

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to copy prompts");
        router.push("/login");
        return;
      }

      if (isLocked) {
        toast.error("Unlock premium to copy this prompt");
        return;
      }

      try {
        await navigator.clipboard.writeText(prompt.promptText);
        setCopied(true);
        toast.success("Prompt copied");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Clipboard copy failed");
      }
    },
    [prompt.promptText, isLocked, user, router]
  );

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to like prompts");
        router.push("/login");
        return;
      }

      if (likeLoading) return;

      setLikeLoading(true);

      try {
        if (liked) {
          await unlikePrompt(prompt.id, user.uid);
          setLiked(false);
          setLikesCount((prev) => Math.max(0, prev - 1));
        } else {
          await likePrompt(prompt.id, user.uid);
          setLiked(true);
          setLikesCount((prev) => prev + 1);
        }
      } catch {
        toast.error("Failed to update like");
      } finally {
        setLikeLoading(false);
      }
    },
    [user, likeLoading, liked, prompt.id, router]
  );

  const handleComment = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to comment");
        router.push("/login");
        return;
      }

      router.push(`/prompt/${prompt.id}#comments`);
    },
    [router, prompt.id, user]
  );

  const handleNativeShare = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to share prompts");
        router.push("/login");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: prompt.title,
            text: shareText,
            url: promptUrl,
          });
          return;
        } catch {
          // fallback to menu
        }
      }

      setShareOpen((prev) => !prev);
    },
    [prompt.title, shareText, promptUrl, user, router]
  );

  const handleCopyLink = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to share prompts");
        router.push("/login");
        return;
      }

      try {
        await navigator.clipboard.writeText(promptUrl);
        setLinkCopied(true);
        toast.success("Link copied");
        setTimeout(() => setLinkCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    },
    [promptUrl, user, router]
  );

  const handleWhatsAppShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to share prompts");
        router.push("/login");
        return;
      }

      const text = encodeURIComponent(`${shareText}\n${promptUrl}`);
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    },
    [shareText, promptUrl, user, router]
  );

  const handleTwitterShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to share prompts");
        router.push("/login");
        return;
      }

      const text = encodeURIComponent(shareText);
      const url = encodeURIComponent(promptUrl);
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [shareText, promptUrl, user, router]
  );

  const handleFacebookShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast.error("Sign in to share prompts");
        router.push("/login");
        return;
      }

      const url = encodeURIComponent(promptUrl);
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [promptUrl, user, router]
  );

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[24px]",
        "border border-white/[0.08] bg-white/[0.03]",
        "backdrop-blur-xl transition-all duration-300",
        "hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)",
      }}
      aria-label={prompt.title}
    >
      {/* image area */}
      <Link href={`/prompt/${prompt.id}`} aria-label={`View ${prompt.title}`}>
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
            <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/25">
              <div className="flex flex-col items-center gap-2 rounded-2xl px-4 py-4 border border-[rgba(245,200,66,0.24)] bg-[rgba(20,16,4,0.45)]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(245,200,66,0.15)",
                    border: "1px solid rgba(245,200,66,0.3)",
                  }}
                >
                  <RiVipCrownLine size={18} style={{ color: "var(--color-gold)" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--color-gold)" }}>
                  Premium Prompt
                </span>
              </div>
            </div>
          )}

          {/* top badges */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span className={cn("badge", prompt.isPremium ? "badge-premium" : "badge-free")}>
              {prompt.isPremium ? "✦ Premium" : "Free"}
            </span>
          </div>

          {/* hover quick copy */}
          {!isLocked && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250"
              style={{
                background: "rgba(7,10,18,0.24)",
              }}
            >
              <button
                onClick={handleCopy}
                aria-label="Copy prompt"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
                  "border border-white/10 bg-[rgba(10,12,22,0.72)] text-white backdrop-blur-md",
                  "shadow-lg transition-all duration-200 hover:scale-[1.02]",
                  copied && "border-emerald-400/30 text-emerald-300"
                )}
              >
                {copied ? (
                  <>
                    <RiCheckLine size={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <RiFileCopyLine size={14} />
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* content */}
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
          {isLocked ? "Unlock premium to view and copy this prompt..." : prompt.promptText}
        </p>

        {/* stats */}
        <div
          className="mb-3 flex items-center gap-3 text-xs"
          style={{ color: "var(--color-text-faint)" }}
        >
          <div className="inline-flex items-center gap-1.5">
            <RiHeartLine size={14} />
            <span>{likesCount}</span>
          </div>

          <div className="inline-flex items-center gap-1.5">
            <RiMessage3Line size={14} />
            <span>{commentsCount}</span>
          </div>
        </div>

        {/* action bar */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleLike}
            disabled={!likeChecked || likeLoading}
            aria-label={liked ? "Unlike prompt" : "Like prompt"}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
              "border transition-all duration-200",
              liked
                ? "border-red-400/20 bg-red-500/10 text-red-300"
                : "border-white/8 bg-white/[0.03] text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {liked ? <RiHeartFill size={14} /> : <RiHeartLine size={14} />}
            Like
          </button>

          <button
            onClick={handleComment}
            aria-label="Open comments"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
              "border border-white/8 bg-white/[0.03] text-[var(--color-text-muted)]",
              "transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            <RiMessage3Line size={14} />
            Comment
          </button>

          <div className="relative" ref={shareRef}>
            <button
              onClick={handleNativeShare}
              aria-label="Share prompt"
              className={cn(
                "w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium",
                "border border-white/8 bg-white/[0.03] text-[var(--color-text-muted)]",
                "transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <RiShareForwardLine size={14} />
              Share
            </button>

            {shareOpen && (
              <div
                className="absolute right-0 bottom-[calc(100%+10px)] z-40 min-w-[190px] rounded-2xl p-2"
                style={{
                  background: "rgba(15,18,28,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {linkCopied ? <RiCheckLine size={13} /> : <FiLink size={13} />}
                    {linkCopied ? "Link copied" : "Copy link"}
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <FaWhatsapp size={13} style={{ color: "#25D366" }} />
                    WhatsApp
                  </button>

                  <button
                    onClick={handleTwitterShare}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <FaTwitter size={13} style={{ color: "#1DA1F2" }} />
                    Twitter / X
                  </button>

                  <button
                    onClick={handleFacebookShare}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-white/5"
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

        {/* secondary footer */}
        <div className="mt-3 flex items-center justify-between">
          {isLocked ? (
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg, #f5c842, #e0a800)",
                color: "#1a1200",
              }}
            >
              <RiVipCrownLine size={13} />
              Unlock Premium
            </Link>
          ) : (
            <button
              onClick={handleCopy}
              aria-label="Copy prompt text"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium",
                "border border-[rgba(188,103,255,0.20)] bg-[rgba(188,103,255,0.08)]",
                "text-[var(--color-primary)] transition-all duration-200 hover:bg-[rgba(188,103,255,0.12)]"
              )}
            >
              {copied ? <RiCheckLine size={13} /> : <RiFileCopyLine size={13} />}
              {copied ? "Copied" : "Copy Prompt"}
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
  );
}
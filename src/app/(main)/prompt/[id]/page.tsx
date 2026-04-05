"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  likePrompt,
  unlikePrompt,
  hasUserLikedPrompt,
} from "@/services/prompts.service";
// ✅ CHANGED: import the secure server action instead of fetchPromptById
import { getPromptSecure } from "@/app/actions/getPrompt";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
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
  RiShareForwardLine,
} from "react-icons/ri";
import { FiLink } from "react-icons/fi";
import { FaWhatsapp, FaTwitter, FaFacebookF } from "react-icons/fa";
import { PremiumLockModal } from "@/components/prompts/PremiumLockModal";

// ───────────────────────────────────────────────────────────────
// Dynamic import of comments section
// ───────────────────────────────────────────────────────────────

const CommentSection = dynamic(
  () =>
    import("@/components/comments/CommentSection").then((m) => ({
      default: m.CommentSection,
    })),
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

// ───────────────────────────────────────────────────────────────
// Skeleton while loading
// ───────────────────────────────────────────────────────────────

function PromptDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div
        className="skeleton rounded-xl"
        style={{ height: "32px", width: "100px" }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div
          className="skeleton rounded-2xl"
          style={{ aspectRatio: "4/3", width: "100%" }}
        />
        <div className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="skeleton rounded" style={{ height: "14px", width: "40%" }} />
            <div className="skeleton rounded" style={{ height: "28px", width: "75%" }} />
            <div className="flex gap-2">
              <div className="skeleton rounded-full" style={{ height: "22px", width: "70px" }} />
              <div className="skeleton rounded-full" style={{ height: "22px", width: "60px" }} />
            </div>
            <div className="skeleton rounded-xl" style={{ height: "1px", width: "100%", marginBlock: "4px" }} />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton rounded" style={{ height: "11px", width: i === 3 ? "50%" : "90%" }} />
            ))}
          </div>
          <div className="skeleton rounded-2xl" style={{ height: "52px" }} />
        </div>
      </div>
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

// ───────────────────────────────────────────────────────────────
// Premium lock overlay
// ───────────────────────────────────────────────────────────────

function PremiumLock({ onUnlock }: { onUnlock: () => void }) {
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
          style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}
        >
          Premium Prompt
        </p>
        <p className="text-xs max-w-[200px]" style={{ color: "var(--color-text-muted)" }}>
          Unlock this prompt to see the full text
        </p>
      </div>
      <div className="flex flex-col gap-2 animate-fadeInUp stagger-2 w-[180px]">
        <button
          onClick={onUnlock}
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
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Copy button
// ───────────────────────────────────────────────────────────────

function CopyButton({ text, isLocked }: { text: string; isLocked: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
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
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
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
        <><RiCheckLine size={16} />Copied!</>
      ) : (
        <><RiFileCopyLine size={16} />Copy Prompt</>
      )}
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// Like button
// ───────────────────────────────────────────────────────────────

function LikeButton({ promptId, initialCount }: { promptId: string; initialCount: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    hasUserLikedPrompt(promptId, user.uid)
      .then(setLiked)
      .finally(() => setChecked(true));
  }, [promptId, user]);

  async function handleToggle() {
    if (!user) { toast.error("Sign in to like prompts."); router.push("/login"); return; }
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
        <span className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
      ) : liked ? (
        <RiHeartFill size={16} style={{ color: "#ff6b6b" }} />
      ) : (
        <RiHeartLine size={16} />
      )}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// Share button
// ───────────────────────────────────────────────────────────────

function ShareButton({ promptId, title, text }: { promptId: string; title: string; text: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/prompt/${promptId}`
      : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNativeShare() {
    if (!user) { toast.error("Sign in to share prompts."); router.push("/login"); return; }
    if (navigator.share) {
      try { await navigator.share({ title, text: text.slice(0, 100), url: shareUrl }); return; }
      catch { /* fall back to menu */ }
    }
    setOpen((v) => !v);
  }

  async function handleCopy() {
    if (!user) { toast.error("Sign in to share prompts."); router.push("/login"); return; }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Failed to copy link"); }
  }

  function handleWhatsApp() {
    if (!user) { toast.error("Sign in to share prompts."); router.push("/login"); return; }
    const msg = encodeURIComponent(`${title}\n\nCheck this AI prompt 👇\n${shareUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener");
  }

  function handleTwitter() {
    if (!user) { toast.error("Sign in to share prompts."); router.push("/login"); return; }
    const msg  = encodeURIComponent(`${title} — ${text.slice(0, 80)}...`);
    const url  = encodeURIComponent(shareUrl);
    const tags = encodeURIComponent("AIArt,MidJourney,AIPrompt");
    window.open(`https://twitter.com/intent/tweet?text=${msg}&url=${url}&hashtags=${tags}`, "_blank", "noopener");
  }

  function handleFacebook() {
    if (!user) { toast.error("Sign in to share prompts."); router.push("/login"); return; }
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleNativeShare}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
          "transition-all duration-200 border border-[rgba(255,255,255,0.08)]",
          "bg-[rgba(17,19,29,0.85)] hover:bg-[rgba(30,32,48,0.95)]",
          "text-[var(--color-text-muted)] hover:text-[#00f2ff]"
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <RiShareForwardLine size={16} />
        Share
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-30 mt-2 w-56 right-0",
            "rounded-2xl border border-[rgba(255,255,255,0.10)]",
            "bg-[rgba(14,16,26,0.98)] shadow-2xl backdrop-blur-xl"
          )}
        >
          <div className="px-3 py-2 text-xs text-[var(--color-text-faint)]">Share this prompt</div>
          <div className="flex flex-col px-1 pb-2">
            <ShareOption icon={copied ? <RiCheckLine className="text-emerald-400" size={14} /> : <FiLink size={14} />} label={copied ? "Link copied" : "Copy link"} onClick={handleCopy} />
            <ShareOption icon={<FaWhatsapp className="text-emerald-400" size={14} />} label="WhatsApp" onClick={handleWhatsApp} />
            <ShareOption icon={<FaTwitter className="text-sky-400" size={14} />} label="Twitter / X" onClick={handleTwitter} />
            <ShareOption icon={<FaFacebookF className="text-blue-500" size={14} />} label="Facebook" onClick={handleFacebook} />
          </div>
        </div>
      )}
    </div>
  );
}

function ShareOption({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text)]",
        "hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150"
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────

export default function PromptDetailPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const id           = params?.id as string;

  const [prompt, setPrompt]               = useState<Prompt | null>(null);
  const [loading, setLoading]             = useState(true);
  const [notFound, setNotFound]           = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const loadPrompt = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // ✅ CHANGED: calls secure server action — promptText is
      //    stripped server-side for free users before it ever
      //    reaches the browser
      const data = await getPromptSecure(id);
      if (!data) { setNotFound(true); return; }
      setPrompt(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPrompt(); }, [loadPrompt]);

  const { canViewPremium, isAdmin } = usePremium();
  const isPremium  = prompt?.isPremium ?? false;
  const canViewFull = !isPremium || canViewPremium;
  const isLocked   = isPremium && !canViewPremium;

  const shouldAutoOpenUnlock = searchParams.get("unlock") === "premium";

  const handleUnlockPremium = useCallback(() => {
    if (!isLocked) return;
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(`/prompt/${id}?unlock=premium`)}`);
      return;
    }
    setShowUnlockModal(true);
  }, [id, isLocked, router, user]);

  const handleUnlockModalClose = useCallback(() => {
    setShowUnlockModal(false);
    if (shouldAutoOpenUnlock) router.replace(`/prompt/${id}`);
  }, [id, router, shouldAutoOpenUnlock]);

  useEffect(() => {
    if (!isLocked || !user || !shouldAutoOpenUnlock) return;
    setShowUnlockModal(true);
  }, [isLocked, shouldAutoOpenUnlock, user]);

  if (loading) return <PromptDetailSkeleton />;

  if (notFound || !prompt) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--color-surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <RiImageLine size={24} style={{ color: "var(--color-text-faint)" }} />
        </div>
        <div className="text-center">
          <p className="font-bold text-base mb-1" style={{ color: "var(--color-text)" }}>
            Prompt Not Found
          </p>
          <p className="text-sm">This prompt may have been removed or doesn&apos;t exist.</p>
        </div>
        <button onClick={() => router.push("/")} className="btn btn-primary">
          <RiArrowLeftLine size={15} />
          Browse Prompts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)", paddingBottom: "var(--space-16)" }}>
      {showUnlockModal && <PremiumLockModal onClose={handleUnlockModalClose} />}

      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 30% 20%, rgba(188,103,255,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(0,242,255,0.05) 0%, transparent 55%)
          `,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-7 flex flex-col gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium w-fit transition-all duration-150 group"
          style={{ color: "var(--color-text-muted)" }}
        >
          <RiArrowLeftLine size={16} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
          {/* LEFT: image */}
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
              <Image
                src={prompt.imageUrl}
                alt={prompt.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {isPremium && !canViewFull && (
                <>
                  <div
                    className="absolute inset-0 z-[5]"
                    style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
                  />
                  <PremiumLock onUnlock={handleUnlockPremium} />
                </>
              )}

              {isPremium && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="badge badge-premium animate-fadeIn"
                    style={{ padding: "5px 10px", fontSize: "11px", boxShadow: "0 4px 12px rgba(245,200,66,0.25)" }}
                  >
                    <RiVipCrownLine size={11} />
                    Premium
                  </span>
                </div>
              )}

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

          {/* RIGHT: details */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5 flex flex-col gap-4 animate-fadeInUp">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-primary">
                  <RiPriceTag3Line size={10} />
                  {prompt.category}
                </span>
                {isPremium ? (
                  <span className="badge badge-premium"><RiVipCrownLine size={10} />Premium</span>
                ) : (
                  <span className="badge badge-free"><RiCheckLine size={10} />Free</span>
                )}
              </div>

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

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-faint)" }}>
                  <RiUserLine size={12} />
                  <span>
                    By{" "}
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {prompt.createdByName}
                    </span>
                  </span>
                </div>
                {prompt.createdAt && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-faint)" }}>
                    <RiCalendarLine size={12} />
                    <span>{formatDate(prompt.createdAt)}</span>
                  </div>
                )}
              </div>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Prompt
                </div>

                {canViewFull ? (
                  <div
                    className="relative rounded-xl p-4 font-mono text-sm leading-relaxed select-all cursor-text"
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
                  <div className="relative rounded-xl overflow-hidden">
                    {/* ✅ promptText is "" from server — never show real text in DOM */}
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
                      {"•••••• •••• •••••••••• •••••••• ••••• •••••••• ••••••••••• ••••••"}
                      {" •••• •••••••••• •••••••• ••••••••••••••• ••••••• •••••••••"}
                    </div>
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl"
                      style={{ background: "rgba(10,12,22,0.70)", backdropFilter: "blur(4px)" }}
                    >
                      <RiLockLine size={18} style={{ color: "var(--color-gold)" }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                        Premium Only
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col gap-2.5 animate-fadeInUp stagger-1">
              <CopyButton text={prompt.promptText} isLocked={isLocked} />
              <div className="flex flex-wrap items-center gap-2">
                <LikeButton promptId={prompt.id} initialCount={prompt.likesCount ?? 0} />
                <ShareButton promptId={prompt.id} title={prompt.title} text={prompt.promptText} />
              </div>
            </div>

            {isAdmin && (
              <div className="glass rounded-2xl p-4 flex flex-col gap-2.5 animate-fadeInUp stagger-2">
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Admin Actions
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/prompts" className="btn btn-ghost btn-sm flex-1 justify-center">
                    Manage Prompts
                  </Link>
                  <Link href="/admin/upload" className="btn btn-secondary btn-sm flex-1 justify-center">
                    Add New
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMMENTS */}
        <div className="animate-fadeInUp stagger-3">
          <CommentSection promptId={prompt.id} />
        </div>
      </div>
    </div>
  );
}
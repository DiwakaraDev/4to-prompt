// src/components/prompts/LikeButton.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { cn } from "@/lib/utils";
import {
  likePrompt,
  unlikePrompt,
  hasUserLikedPrompt,
} from "@/services/prompts.service";
import { useAuthStore } from "@/store/auth.store";

interface Props {
  promptId:     string;
  initialCount: number;
}

export default function LikeButton({ promptId, initialCount }: Props) {
  const user    = useAuthStore((s) => s.user);
  const [liked,   setLiked]   = useState(false);
  const [count,   setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check liked state on mount / when user changes
  useEffect(() => {
    if (!user) { setLiked(false); return; }
    let cancelled = false;

    hasUserLikedPrompt(promptId, user.uid)
      .then((result) => { if (!cancelled) setLiked(result); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [promptId, user]);

  const toggle = useCallback(async () => {
    if (!user) return; // Silently ignore — Navbar will prompt login if needed
    if (loading) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setLoading(true);

    try {
      if (wasLiked) {
        await unlikePrompt(promptId, user.uid);
      } else {
        await likePrompt(promptId, user.uid);
      }
    } catch (err) {
      // Rollback on failure
      console.error("Like toggle failed:", err);
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }, [user, liked, loading, promptId]);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Unlike prompt" : "Like prompt"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium",
        "transition-all duration-200 select-none",
        liked
          ? "text-pink-400 bg-pink-400/10 hover:bg-pink-400/20"
          : "text-[#a0a0a0] bg-white/5 hover:bg-white/10 hover:text-pink-400",
        loading && "opacity-60 cursor-not-allowed",
      )}
    >
      {liked
        ? <AiFillHeart    className="w-5 h-5 animate-pulse-once" />
        : <AiOutlineHeart className="w-5 h-5" />}
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
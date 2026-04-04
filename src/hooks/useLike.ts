// src/hooks/useLike.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { hasLiked, toggleLike } from "@/services/like.service";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export function useLike(promptId: string, initialCount: number) {
  const { user }        = useAuthStore();
  const [liked, setLiked]   = useState(false);
  const [count, setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check if already liked on mount
  useEffect(() => {
    if (!user) return;
    hasLiked(promptId, user.uid).then(setLiked);
  }, [promptId, user]);

  const toggle = useCallback(async () => {
    if (!user) {
      toast.error("Sign in to like prompts");
      return;
    }
    if (loading) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => wasLiked ? c - 1 : c + 1);
    setLoading(true);

    try {
      await toggleLike(promptId, user.uid);
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setCount((c) => wasLiked ? c + 1 : c - 1);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  }, [user, liked, loading, promptId]);

  return { liked, count, toggle, loading };
}
// src/hooks/usePrompts.ts
"use client";

import { useState, useCallback } from "react";
import { fetchPrompts } from "@/services/prompts.service";
import type { Prompt, PromptCategory } from "@/types";
import type { QueryDocumentSnapshot } from "firebase/firestore";

interface UsePromptsOptions {
  filterPremium?: boolean;
  category?:      PromptCategory | "All";
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const [prompts,  setPrompts]  = useState<Prompt[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [hasMore,  setHasMore]  = useState(true);
  const [lastDoc,  setLastDoc]  = useState<QueryDocumentSnapshot | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [initiated, setInitiated] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPrompts(null, options.filterPremium, options.category);
      setPrompts(result.data);
      setLastDoc(result.lastDoc as QueryDocumentSnapshot | null);
      setHasMore(result.hasMore);
      setInitiated(true);
    } catch {
      setError("Failed to load prompts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [options.filterPremium, options.category]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;
    setLoading(true);
    try {
      const result = await fetchPrompts(lastDoc, options.filterPremium, options.category);
      setPrompts(prev => [...prev, ...result.data]);
      setLastDoc(result.lastDoc as QueryDocumentSnapshot | null);
      setHasMore(result.hasMore);
    } catch {
      setError("Failed to load more prompts.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastDoc, options.filterPremium, options.category]);

  const reset = useCallback(() => {
    setPrompts([]);
    setLastDoc(null);
    setHasMore(true);
    setInitiated(false);
  }, []);

  return { prompts, loading, hasMore, error, initiated, loadInitial, loadMore, reset };
}
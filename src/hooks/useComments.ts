// src/hooks/useComments.ts
"use client";

import { useState, useEffect } from "react";
import { subscribeToComments } from "@/services/comments.service";
import type { Comment } from "@/types";

export function useComments(promptId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!promptId) return;

    const unsub = subscribeToComments(promptId, (data) => {
      setComments(data);
      setLoading(false);
    });

    return () => unsub();
  }, [promptId]);

  return { comments, loading };
}
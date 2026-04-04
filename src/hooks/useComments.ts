// src/hooks/useComments.ts
"use client";
import { useState, useEffect } from "react";
import { subscribeToComments, postComment, deleteComment } from "@/services/comments.service";
import { useAuthStore } from "@/store/auth.store";
import type { Comment }  from "@/types";
import toast from "react-hot-toast";

export function useComments(promptId: string) {
  const { user }          = useAuthStore();
  const [comments, setComments]   = useState<Comment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [posting, setPosting]     = useState(false);
  const [text, setText]           = useState("");

  // Real-time listener
  useEffect(() => {
    const unsub = subscribeToComments(
      promptId,
      (data) => { setComments(data); setLoading(false); },
      (err)  => { console.error(err); setLoading(false); },
    );
    return unsub; // cleanup on unmount
  }, [promptId]);

  const submit = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 1) return;
    if (trimmed.length > 500) { toast.error("Max 500 characters"); return; }

    setPosting(true);
    try {
      await postComment({
        promptId,
        userId:       user.uid,
        userName:     user.name,
        userPhotoURL: user.photoURL,
        text:         trimmed,
      });
      setText("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const remove = async (commentId: string, ownerId: string) => {
    const isOwner = user?.uid === ownerId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) return;

    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return { comments, loading, posting, text, setText, submit, remove };
}
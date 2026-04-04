// src/components/comments/CommentSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  subscribeToComments,
  postComment,
  deleteComment,
} from "@/services/comments.service";
import type { Comment } from "@/types";
import { cn } from "@/lib/utils";
import { RiDeleteBin6Line, RiSendPlane2Line } from "react-icons/ri";
import toast from "react-hot-toast";

interface CommentSectionProps {
  promptId: string;
}

export function CommentSection({ promptId }: CommentSectionProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!promptId) return;

    const unsub = subscribeToComments(
      promptId,
      (data: Comment[]) => {
        setComments(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
        toast.error("Failed to load comments");
      }
    );

    return () => unsub();
  }, [promptId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to comment");
      router.push("/login");
      return;
    }
    if (!input.trim()) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      await postComment({
        promptId,
        userId: user.uid,
        userName: user.name,
        userPhotoURL: user.photoURL,
        text: input.trim(),
      });
      setInput("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(comment: Comment) {
    if (!user) return;

    const isOwner = comment.userId === user.uid;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      toast.error("You can only delete your own comments");
      return;
    }

    try {
      await deleteComment(comment.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  }

  return (
    <section
      aria-label="Comments"
      className="glass rounded-2xl p-5 flex flex-col gap-4"
    >
      <div
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-text-faint)" }}
      >
        Comments ({comments.length})
      </div>

      {/* input */}
      <form
        onSubmit={handleSubmit}
        onClick={() => {
          if (!user) {
            toast.error("Sign in to comment");
            router.push("/login");
          }
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            user ? "Write a comment…" : "Sign in to join the comment section"
          }
          disabled={!user || submitting}
          className={cn(
            "flex-1 rounded-xl px-3 py-2.5 text-xs bg-[rgba(8,10,18,0.9)]",
            "border border-white/10 outline-none",
            "placeholder:text-text-faint",
            "focus:border-primary"
          )}
          style={{ color: "var(--color-text)" }}
        />
        <button
          type="submit"
          disabled={!user || submitting || !input.trim()}
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold",
            "border border-[rgba(188,103,255,0.35)] bg-primary-muted",
            "text-primary transition-opacity",
            (!user || submitting || !input.trim()) && "opacity-50 cursor-not-allowed"
          )}
        >
          <RiSendPlane2Line size={14} />
        </button>
      </form>

      {/* list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <>
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
          </>
        ) : comments.length === 0 ? (
          <p
            className="text-xs"
            style={{ color: "var(--color-text-faint)" }}
          >
            No comments yet. Be the first one to share your thoughts.
          </p>
        ) : (
          comments.map((c) => {
            const canDelete =
              user && (c.userId === user.uid || user.role === "admin");
            return (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-xl bg-white/2 px-3 py-2.5"
                style={{ background: "rgba(8,10,18,0.75)" }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                  style={{
                    background: "rgba(188,103,255,0.16)",
                    color: "var(--color-primary)",
                  }}
                >
                  {c.userName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {c.userName}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="text-[10px] text-text-faint hover:text-red-400"
                      >
                        <RiDeleteBin6Line size={12} />
                      </button>
                    )}
                  </div>
                  <p
                    className="mt-1 text-xs leading-snug"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
// src/components/comments/CommentSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { addComment, deleteComment } from "@/services/comments.service";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiSendPlane2Line, RiDeleteBinLine, RiUserLine,
} from "react-icons/ri";

interface CommentSectionProps {
  promptId: string;
}

export function CommentSection({ promptId }: CommentSectionProps) {
  const { user }    = useAuth();
  const { comments, loading } = useComments(promptId);
  const [text,       setText]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      await addComment({
        promptId,
        userId:       user.uid,
        userName:     user.name,
        userPhotoURL: user.photoURL,
        text:         text.trim(),
      });
      setText("");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteComment(id);
      toast.success("Comment deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}>
          Comments ({comments.length})
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Input */}
        {user ? (
          <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                            text-xs font-bold"
              style={{ background: "var(--color-primary-muted)", color: "var(--color-primary)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={500}
                className="input flex-1"
                aria-label="Write a comment"
              />
              <button type="submit"
                disabled={!text.trim() || submitting}
                className="btn btn-primary btn-sm shrink-0"
                aria-label="Post comment">
                {submitting
                  ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white
                                     rounded-full animate-spin" />
                  : <RiSendPlane2Line size={14} />}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm mb-2.5" style={{ color: "var(--color-text-muted)" }}>
              Sign in to leave a comment
            </p>
            <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="skeleton skeleton-avatar" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="skeleton" style={{ height: "11px", width: "30%" }} />
                  <div className="skeleton skeleton-text" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <RiUserLine size={20} style={{ color: "var(--color-text-faint)", marginBottom: "8px" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map(comment => {
              const canDelete = user?.uid === comment.userId || user?.role === "admin";
              return (
                <div key={comment.id}
                  className="flex gap-3 group/comment animate-fadeIn">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                  text-xs font-bold"
                    style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)" }}>
                    {comment.userName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold"
                          style={{ color: "var(--color-text)" }}>
                          {comment.userName}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                          {comment.createdAt ? formatDate(comment.createdAt) : ""}
                        </span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleting === comment.id}
                          aria-label="Delete comment"
                          className="opacity-0 group-hover/comment:opacity-100 btn btn-danger btn-sm
                                     transition-opacity duration-150"
                          style={{ minHeight: "24px", padding: "2px 8px", fontSize: "11px" }}>
                          {deleting === comment.id
                            ? <span className="w-3 h-3 border border-current/30 border-t-current
                                               rounded-full animate-spin" />
                            : <RiDeleteBinLine size={11} />}
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-muted)" }}>
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
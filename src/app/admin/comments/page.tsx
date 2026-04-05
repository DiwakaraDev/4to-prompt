// src/app/admin/comments/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, limit,
  getDocs, deleteDoc, doc, Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  RiChat3Line, RiDeleteBin3Line,
  RiUser3Line, RiTimeLine, RiRefreshLine,
} from "react-icons/ri";

interface AdminComment {
  id:        string;
  text:      string;
  userId:    string;
  userName:  string;
  promptId:  string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | null;
}

function formatDate(ts: AdminComment["createdAt"]): string {
  if (!ts) return "—";
  const seconds = "seconds" in ts ? ts.seconds : 0;
  return new Date(seconds * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric",
    year:  "numeric",
    hour:  "2-digit", minute: "2-digit",
  });
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      setComments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminComment)),
      );
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    setDeleting(commentId);
    try {
      await deleteDoc(doc(db, "comments", commentId));
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted.");
    } catch {
      toast.error("Failed to delete comment.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize:   "var(--text-xl)",
            fontWeight: 800,
          }}>
            Comments
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {loading ? "Loading…" : `${comments.length} comment${comments.length !== 1 ? "s" : ""} (latest 100)`}
          </p>
        </div>
        <button
          onClick={fetchComments}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
            "transition-all duration-150 hover:bg-white/8",
            loading && "opacity-50 cursor-not-allowed",
          )}
          style={{
            background: "var(--color-surface-2)",
            border:     "1px solid rgba(255,255,255,0.07)",
            color:      "var(--color-text-muted)",
          }}
        >
          <RiRefreshLine size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl" style={{ height: "88px" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--color-surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <RiChat3Line size={26} style={{ color: "var(--color-text-faint)" }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            No comments yet
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Comments will appear here once users start interacting.
          </p>
        </div>
      )}

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="flex flex-col gap-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="glass rounded-2xl p-4 flex items-start gap-4 group
                         hover:border-[rgba(188,103,255,0.15)] transition-all duration-150"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                style={{ background: "var(--color-primary-muted)", color: "var(--color-primary)" }}>
                {comment.userName?.charAt(0)?.toUpperCase() ?? <RiUser3Line size={14} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                    {comment.userName ?? "Anonymous"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]"
                    style={{ color: "var(--color-text-faint)" }}>
                    <RiTimeLine size={10} />
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.promptId && (
                    <a
                      href={`/prompt/${comment.promptId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-1.5 py-0.5 rounded-md transition-colors hover:opacity-80"
                      style={{
                        background: "rgba(188,103,255,0.08)",
                        border:     "1px solid rgba(188,103,255,0.18)",
                        color:      "var(--color-primary)",
                      }}
                    >
                      View Prompt ↗
                    </a>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {comment.text}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deleting === comment.id}
                aria-label="Delete comment"
                className={cn(
                  "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-all duration-150",
                  "hover:bg-red-500/15",
                  deleting === comment.id && "opacity-50 cursor-not-allowed",
                )}
                style={{ color: "var(--color-error)" }}
              >
                {deleting === comment.id
                  ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  : <RiDeleteBin3Line size={14} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
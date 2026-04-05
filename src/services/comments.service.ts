// src/services/comments.service.ts
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db }      from "@/firebase/config";
import type { Comment } from "@/types";
import type { FirebaseTimestamp } from "@/types";

// ─── Helper ──────────────────────────────────────────────────────────────────
// Safely resolves either a Firestore Timestamp or a plain serialized object
// to a millisecond number for sorting/comparison.
function toMs(ts: FirebaseTimestamp | null | undefined): number {
  if (!ts) return 0;
  // Firestore SDK Timestamp — has .toMillis()
  if (typeof (ts as { toMillis?: unknown }).toMillis === "function") {
    return (ts as { toMillis: () => number }).toMillis();
  }
  // Plain serialized form — { seconds: number; nanoseconds: number }
  if (typeof (ts as { seconds?: unknown }).seconds === "number") {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

// ─── Subscribe ───────────────────────────────────────────────────────────────
/**
 * Real-time comment listener for a prompt.
 * Returns unsubscribe function.
 */
export function subscribeToComments(
  promptId:  string,
  callback:  (comments: Comment[]) => void,
  onError?:  (err: Error) => void,
): () => void {
  const q = query(
    collection(db, "comments"),
    where("promptId", "==", promptId),
    limit(50),
  );

  return onSnapshot(
    q,
    (snap) => {
      const comments = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Comment, "id">),
        }))
        .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
      callback(comments);
    },
    (err) => onError?.(err as Error),
  );
}

// ─── Post ─────────────────────────────────────────────────────────────────────
/**
 * Post a new comment
 */
export async function postComment(data: {
  promptId:      string;
  userId:        string;
  userName:      string;
  userPhotoURL?: string;
  text:          string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "comments"), {
    ...data,
    text:      data.text.trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Delete ───────────────────────────────────────────────────────────────────
/**
 * Delete a comment (owner or admin only — enforced by Firestore rules)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
}
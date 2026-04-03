// src/services/comments.service.ts
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Comment } from "@/types";

const COMMENTS_COL = "comments";

// ─── Real-time listener ───────────────────────────────────────
export function subscribeToComments(
  promptId: string,
  callback: (comments: Comment[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COMMENTS_COL),
    where("promptId", "==", promptId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(
      d => ({ id: d.id, ...d.data() } as Comment),
    );
    callback(comments);
  });
}

// ─── Add comment ──────────────────────────────────────────────
export async function addComment(
  data: Omit<Comment, "id" | "createdAt">,
) {
  return addDoc(collection(db, COMMENTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// ─── Delete comment ───────────────────────────────────────────
export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COL, commentId));
}

// ─── Fetch comments for admin ─────────────────────────────────
export async function fetchAllCommentsAdmin() {
  const { getDocs } = await import("firebase/firestore");
  const q    = query(
    collection(db, COMMENTS_COL),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
}
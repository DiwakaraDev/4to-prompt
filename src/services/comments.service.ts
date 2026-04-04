// src/services/comment.service.ts
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
    limit(50)
  );

  return onSnapshot(
    q,
    (snap) => {
      const comments = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return aTime - bTime;
        }) as Comment[];
      callback(comments);
    },
    (err) => onError?.(err as Error),
  );
}

/**
 * Post a new comment
 */
export async function postComment(data: {
  promptId:     string;
  userId:       string;
  userName:     string;
  userPhotoURL?: string;
  text:         string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "comments"), {
    ...data,
    text:      data.text.trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Delete a comment (owner or admin only — enforced by Firestore rules)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
}
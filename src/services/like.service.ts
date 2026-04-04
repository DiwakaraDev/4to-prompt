// src/services/like.service.ts
import {
  doc, getDoc, setDoc, deleteDoc,
  runTransaction, serverTimestamp, collection,
} from "firebase/firestore";
import { db } from "@/firebase/config";

/**
 * Toggle like on a prompt.
 * Uses a transaction to atomically update likesCount.
 * Returns true if liked, false if unliked.
 */
export async function toggleLike(
  promptId: string,
  userId:   string,
): Promise<boolean> {
  const likeRef   = doc(db, "prompts", promptId, "likes", userId);
  const promptRef = doc(db, "prompts", promptId);

  return runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);

    if (likeSnap.exists()) {
      // Unlike
      tx.delete(likeRef);
      tx.update(promptRef, { likesCount: Math.max(0, (await tx.get(promptRef)).data()!.likesCount - 1) });
      return false;
    } else {
      // Like
      tx.set(likeRef, { userId, createdAt: serverTimestamp() });
      tx.update(promptRef, { likesCount: ((await tx.get(promptRef)).data()!.likesCount ?? 0) + 1 });
      return true;
    }
  });
}

/**
 * Check if a user has liked a prompt
 */
export async function hasLiked(
  promptId: string,
  userId:   string,
): Promise<boolean> {
  const likeRef = doc(db, "prompts", promptId, "likes", userId);
  const snap    = await getDoc(likeRef);
  return snap.exists();
}